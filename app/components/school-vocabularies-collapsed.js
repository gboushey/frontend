import Ember from 'ember';

const { Component, computed } = Ember;
const { reads, sort } = computed;

export default Component.extend({
  school: null,
  vocabularies: reads('school.vocabularies'),
  sortBy: ['title'],
  sortedVocabularies: sort('vocabularies', 'sortBy'),
});
