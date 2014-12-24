
SantaTips = new Mongo.Collection("santa_tips");

if (Meteor.isClient) {
    Template.body.events({
        'submit .santa-tip': function (event) {
            var tip = event.target["santa-tip"].value;

            Meteor.call("updateSantaTip", {santaTip: tip});

            return false;
        }
    });

    Template.body.helpers({
        myTip: function () {
            var user = Meteor.user(),
                santaTip = null;

            if (user) {
                santaTip = SantaTips.findOne({userId: user._id}).santaTip;
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
