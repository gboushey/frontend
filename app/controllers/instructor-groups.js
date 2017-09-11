import Ember from 'ember';
import DS from 'ember-data';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, RSVP, isEmpty, isPresent, inject } = Ember;
const { gt } = computed;
const { service } = inject;
const { PromiseArray } = DS;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  schoolId: null,
  titleFilter: null,
  showNewInstructorGroupForm: false,
  newInstructorGroups: [],
  instructorGroups: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)){
      defer.resolve([]);
    } else {
      this.get('store').query('instructor-group', {
        filters: {
          school: schoolId
        }
      }).then(instructorGroups => {
        defer.resolve(instructorGroups);
      });
    }

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  changeTitleFilter: task(function * (value) {
    const clean = escapeRegExp(value);
    this.set('titleFilter', clean);
    yield timeout(250);

    return clean;
  }).restartable(),

  hasMoreThanOneSchool: gt('model.schools.length', 1),
  filteredInstructorGroups: computed(
    'changeTitleFilter.lastSuccessful.value',
    'instructorGroups.[]',
    function(){
      let defer = RSVP.defer();
      let title = this.get('changeTitleFilter.lastSuccessful.value');
      let exp = new RegExp(title, 'gi');
      this.get('instructorGroups').then(instructorGroups => {
        let filteredInstructorGroups;
        if(isEmpty(title)){
          filteredInstructorGroups = instructorGroups;
        } else {
          filteredInstructorGroups = instructorGroups.filter(instructorGroup => {
            return isPresent(instructorGroup.get('title')) && instructorGroup.get('title').match(exp);
          });
        }
        defer.resolve(filteredInstructorGroups.sortBy('title'));
      });


      return PromiseArray.create({
        promise: defer.promise
      });
    }
  ),
  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    const schoolId = this.get('schoolId');
    if(isPresent(schoolId)){
      let school =  schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),
  actions: {
    removeInstructorGroup(instructorGroup) {
      instructorGroup.deleteRecord();
      instructorGroup.save();
    },
    saveNewInstructorGroup(newInstructorGroup) {
      let newInstructorGroups = this.get('newInstructorGroups').toArray();
      return newInstructorGroup.save().then(savedInstructorGroup => {
        newInstructorGroups.pushObject(savedInstructorGroup);
        this.set('newInstructorGroups', newInstructorGroups);
        this.set('showNewInstructorGroupForm', false);
      });
    },
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
    toggleNewInstructorGroupForm() {
      this.set('showNewInstructorGroupForm', !this.get('showNewInstructorGroupForm'));
    }
  },
});
