import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  tagName: 'section',
  classNames: ['collapsed-objectives'],
  subject: null,

  objectives: computed('subject.objectives.[]', async function(){
    const subject = this.get('subject');
    const objectives = await subject.get('objectives');

    return objectives;
  }),
  objectivesWithParents: computed('objectives.[]', async function(){
    const objectives = await this.get('objectives');
    const objectivesWithParents = objectives.filter(objective => {
      const parentIds = objective.hasMany('parents').ids();

      return parentIds.length > 0;
    });

    return objectivesWithParents;
  }),
  objectivesWithMesh: computed('objectives.[]', async function(){
    const objectives = await this.get('objectives');
    const objectivesWithMesh = objectives.filter(objective => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();

      return meshDescriptorIds.length > 0;
    });

    return objectivesWithMesh;
  }),
});
