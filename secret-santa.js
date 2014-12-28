
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
        }
    });
}
