import Ember from 'ember';

export default Ember.Component.extend({
  objective: null,
  objectiveGroups: [],
  selectedGroupId: null,
  availableGroups: function(){
    return this.get('objectiveGroups').map(function(group){
      return {
        id: group.get('id'),
        title: group.get('title')
      };
    }).sortBy('title');
  }.property('objectiveGroups.@each.id', 'objectiveGroups.@each.title'),
  multipleParents: false,
  currentObjectiveGroup: function(){
    var selectedGroupId = this.get('selectedGroupId');
    if(selectedGroupId){
      var matchingGroups = this.get('objectiveGroups').filterBy('id', selectedGroupId);
      if(matchingGroups.length > 0){
        return matchingGroups.get('firstObject');
      }
    }

    return null;
  }.property('selectedGroupId', 'objectiveGroups.@each'),
  watchGroups: function(){
    Ember.run.later(this, function(){
      if(this.get('selectedGroupId') == null){
        var firstGroup = this.get('availableGroups.firstObject');
        if(firstGroup != null){
          this.set('selectedGroupId', firstGroup.id);
        }
      }
    }, 500);
  }.observes('availableGroups.@each'),
  actions: {
    addParent: function(parentObj){
      this.sendAction('addParent', parentObj);
    },
    removeParent: function(parentObj){
      this.sendAction('removeParent', parentObj);
    }
  }
});
