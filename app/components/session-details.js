import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  tagName: 'section',
  classNames: ['session-details'],
  sessionTypes: [],
  session: null,
  editable: not('course.locked'),
  sessionObjectiveDetails: null,
  sessionTaxonomyDetails: null,

  didInsertElement() {
    const id = this.$().attr('id');

    scrollTo(`#${id}`);
  },
  actions: {
    save() {
      const  session = this.get('session');
      session.save();
    },
  }
});
