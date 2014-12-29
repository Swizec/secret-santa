
SantaTips = new Mongo.Collection("santa_tips");

if (Meteor.isClient) {
    Template.body.events({
        'submit .santa-tip': function (event) {
            var tip = event.target["santa-tip"].value;

            Meteor.call("updateSantaTip", {santaTip: tip},
                       function () {
                           $(".feedback")
                               .css("opacity", 1)
                               .html("")
                               .addClass("text-success")
                               .html("Your tip has been sent to the Elves for processing!")
                               .fadeTo(10000, 0);
                       });

            return false;
        }
    });

    Template.body.helpers({
        myTip: function () {
            var user = Meteor.user(),
                santaTip = null;

            if (user) {
                var _tip = SantaTips.findOne({userId: user._id});
                santaTip = _tip ? _tip.santaTip : "";
            }

            return santaTip;
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
    
    Meteor.methods({
        updateSantaTip: function (tip) {
            var currentUser = Meteor.user();

            SantaTips.update(
                {userId: currentUser._id},
                {userId: currentUser._id,
                 santaTip: tip.santaTip
                },
                {upsert: true}
            );
        },

        deleteHairy: function () {
            var hairy1 = Meteor.users.findOne({_id: "gxhGEowp6QYyErd2B"});
            var hairy2 = Meteor.users.findOne({_id: "mGEnMroJYXyuuTzce"});

            return [hairy1, hairy2];
        },

        makeMatches: function () {
            var tips = _.shuffle(SantaTips.find(/*{"match": {"$exists": false}}*/)
                                 .map(function (d) { 
                                     d.fake_name = Fake.user().fullname;
                                     return d; 
                                 })),
                rotated = _.clone(tips);

            rotated.unshift(rotated.pop());
            
            var matches = _.zip(tips, rotated),
                counter = 0;

            matches.forEach(function (match) {
                var a = match[0],
                    b = match[1];

                a.match = b;
                b.match = a;

                SantaTips.update({_id: a._id},
                                 {$set: {match: b._id,
                                         fake_name: a.fake_name}});
                SantaTips.update({_id: b._id},
                                 {$set: {match: a._id,
                                         fake_name: b.fake_name}});

                counter++;
            });

            return "Made "+counter+" matches";
        },

        notifyMatches: function () {
            var counter = 0;

            SantaTips.find({match: {$exists: true}})
                .map(function (tip) {
                    var match = SantaTips.findOne({_id: tip.match}),
                        email = Meteor.users.findOne({_id: tip.userId}).emails[0].address;

                    Meteor.Sendgrid.send({
                        to: 'swizec@swizec.com',
                        from: 'swizec@swizec.com',
                        subject: "Dear Secret Santa",
                        text: ["Hi Santa,", "You are gifting: "+match.fake_name,
                               "Their secret hint is:", match.santaTip,
                               "", "Have fun!",
                              "PS: you can still check your own tip at secret-santa.meteor.com"].join("\n\n")
                    });

                    counter++;
                });

            return "Sent "+counter+" emails";
        }
    });
}
