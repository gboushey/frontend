import Ember from 'ember';
import DS from 'ember-data';
import momentFormat from 'ember-moment/computeds/format';

const {computed, inject, RSVP, isEmpty} = Ember;
const {PromiseObject, PromiseArray} = DS;
const {notEmpty} = computed;
const { service } = inject;

export default Ember.Component.extend({
  store: service(),
  i18n: service(),
  event: null,
  classNames: ['ilios-event'],
  description: computed('offering.session.description.description', function(){
    let defer = RSVP.defer();
    this.get('offering').then(offering=>{
      offering.get('session').then(session=>{
        session.get('sessionDescription').then(description=>{
          if(isEmpty(description)){
            defer.resolve(null);
          } else {
            defer.resolve(description.get('description'));
          }
        });
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  isOffering: notEmpty('event.offering'),
  niceStartTime: momentFormat('event.startDate', 'dddd, MMMM Do YYYY, h:mm a'),
  offeredAt: computed('niceStartTime', function(){
    return this.get('i18n').t('calendar.offeredAt', {date: this.get('niceStartTime')});
  }),
  instructorList: computed('isOffering', 'offering.allInstructors.[]', function(){
    let defer = RSVP.defer();
    
    if(this.get('isOffering')){
      this.get('offering').then(offering => {
        offering.get('allInstructors').then(instructors => {
          let instructorNames = instructors.sortBy('lastName').mapBy('fullName');
          defer.resolve(instructorNames.join(', '));
        });
      });
    }
    
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  taughtBy: computed('i18n.locale', 'instructorList', function(){
    let defer = RSVP.defer();
    
    this.get('instructorList').then(instructors => {
      defer.resolve(this.get('i18n').t('calendar.taughtBy', {instructors}));
    });
    
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  sessionIs: computed('offering.session.sessionType', function(){
    let defer = RSVP.defer();
    
    this.get('offering').then(offering => {
      offering.get('session').then(session => {
        session.get('sessionType').then(sessionType => {
          defer.resolve(this.get('i18n').t('calendar.sessionIs', {type: sessionType.get('title')}));
        });
      });
    });
    
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  offering: computed('event.offering', function(){
    let offeringId = this.get('event.offering');
    if(!offeringId){
      return null;
    }
    return PromiseObject.create({
      promise: this.get('store').find('offering', offeringId)
    });
  }),
  coursePhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('courses.courseTitle');
  }),
  courseObjectivesPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.courseObjectives');
  }),
  courseLearningMaterialsPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.courseLearningMaterials');
  }),
  courseObjectives: computed('i18n.locale', 'offering.session.course.objectives.@each.topParents.[]', function(){
    let defer = RSVP.defer();
    
    this.get('offering').then(offering => {
      offering.get('session').then(session => {
        session.get('course').then(course => {
          course.get('objectives').then(objectives => {
            let promises = [];
            let mappedObjectives = [];
            objectives.forEach(objective => {
              promises.pushObject(objective.get('topParents').then(parents => {
                let parent = parents.get('firstObject');
                promises.pushObject(parent.get('competency').then(competency => {
                  //strip all HTML
                  let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                  if(isEmpty(competency)){
                    mappedObjectives.pushObject({
                      title,
                      domain: this.get('i18n').t('calendar.noAssociatedCompetencies')
                    });
                  } else {
                    promises.pushObject(competency.get('domain').then(domain => {
                      mappedObjectives.pushObject({
                        title,
                        domain: competency.get('title') + ' (' + domain.get('title') + ')'
                      });
                    }));
                  }
                  
                }));
              }));
            });
            RSVP.all(promises).then(()=>{
              defer.resolve(mappedObjectives);
            });
          });
        });
      });
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  courseLearningMaterials: computed(
    'i18n.locale',
    'offering.session.course.learningMaterials.@each.learningMaterial.[title,absoluteFileUri]',
    function(){
      let defer = RSVP.defer();
      
      this.get('offering').then(offering => {
        offering.get('session').then(session => {
          session.get('course').then(course => {
            course.get('learningMaterials').then(courseLearningMaterials => {
              let promises = [];
              let mappedLearningMaterials = [];
              courseLearningMaterials.forEach(courseLearningMaterial => {
                
                promises.pushObject(courseLearningMaterial.get('learningMaterial').then(learningMaterial => {
                  mappedLearningMaterials.pushObject({
                    title: learningMaterial.get('title'),
                    description: learningMaterial.get('description'),
                    required: courseLearningMaterial.get('required'),
                    notes: courseLearningMaterial.get('publicNotes'),
                    url: learningMaterial.get('url'),
                    type: learningMaterial.get('type'),
                    mimetype: learningMaterial.get('mimetype'),
                    filesize: learningMaterial.get('filesize'),
                    citation: learningMaterial.get('citation'),
                  });
                }));
              });
              RSVP.all(promises).then(()=>{
                defer.resolve(mappedLearningMaterials);
              });
            });
          });
        });
      });
      
      return PromiseArray.create({
        promise: defer.promise
      });
  }),
  sessionPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('general.session');
  }),
  sessionObjectivesPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.sessionObjectives');
  }),
  sessionLearningMaterialsPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.sessionLearningMaterials');
  }),
  sessionObjectives: computed('i18n.locale', 'offering.session.objectives.@each.topParents.[]', function(){
    let defer = RSVP.defer();
    
    this.get('offering').then(offering => {
      offering.get('session').then(session => {
        session.get('objectives').then(objectives => {
          let promises = [];
          let mappedObjectives = [];
          objectives.forEach(objective => {
            promises.pushObject(objective.get('topParents').then(parents => {
              let parent = parents.get('firstObject');
              promises.pushObject(parent.get('competency').then(competency => {
                //strip all HTML
                let title = objective.get('title').replace(/(<([^>]+)>)/ig,"");
                if(isEmpty(competency)){
                  mappedObjectives.pushObject({
                    title,
                    domain: this.get('i18n').t('calendar.noAssociatedCompetencies')
                  });
                } else {
                  promises.pushObject(competency.get('domain').then(domain => {
                    mappedObjectives.pushObject({
                      title,
                      domain: competency.get('title') + ' (' + domain.get('title') + ')'
                    });
                  }));
                }
                
              }));
            }));
          });
          RSVP.all(promises).then(()=>{
            defer.resolve(mappedObjectives);
          });
        });
      });
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  sessionLearningMaterials: computed(
    'i18n.locale',
    'offering.session.learningMaterials.@each.learningMaterial.[title,absoluteFileUri]',
    function(){
      let defer = RSVP.defer();
      
      this.get('offering').then(offering => {
        offering.get('session').then(session => {
          session.get('learningMaterials').then(sessionLearningMaterials => {
            let promises = [];
            let mappedLearningMaterials = [];
            sessionLearningMaterials.forEach(sessionLearningMaterial => {
              
              promises.pushObject(sessionLearningMaterial.get('learningMaterial').then(learningMaterial => {
                mappedLearningMaterials.pushObject({
                  title: learningMaterial.get('title'),
                  description: learningMaterial.get('description'),
                  required: sessionLearningMaterial.get('required'),
                  notes: sessionLearningMaterial.get('publicNotes'),
                  url: learningMaterial.get('url'),
                  type: learningMaterial.get('type'),
                  mimetype: learningMaterial.get('mimetype'),
                  filesize: learningMaterial.get('filesize'),
                  citation: learningMaterial.get('citation'),
                });
              }));
            });
            RSVP.all(promises).then(()=>{
              defer.resolve(mappedLearningMaterials);
            });
          });
        });
      });
      
      return PromiseArray.create({
        promise: defer.promise
      });
  }),
  requiredPhrase: computed('i18n.locale', function(){
    return this.get('i18n').t('general.required');
  }),
  course: computed('offering.session.course', function(){
    let defer = RSVP.defer();
    this.get('offering').then(offering=>{
      offering.get('session').then(session=>{
        session.get('course').then(course=>{
          defer.resolve(course);
        });
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  //session name is already taken by ember-simple-auth
  thesession: computed('offering.session', function(){
    let defer = RSVP.defer();
    this.get('offering').then(offering=>{
      offering.get('session').then(session=>{
        defer.resolve(session);
      });
    });
    return PromiseObject.create({
      promise: defer.promise
    });
  }),
});
