/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;

module('Acceptance: Dashboard Calendar', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school', {
      sessionTypes: [1,2,3],
      disciplines: [1,2,3],
      programs: [1],
      courses: [1]
    });
    server.create('discipline', {
      sessions: [1],
      school: 1,
    });
    server.create('discipline', {
      courses: [1],
      school: 1,
    });
    server.create('discipline', {
      school: 1,
    });
    server.create('program', {
      programYears: [1,2],
      school: 1,
    });
    server.create('programYear', {
      cohort: 1,
      program: 1
    });
    server.create('programYear', {
      cohort: 2,
      program: 1
    });
    server.create('cohort', {
      courses: [1],
      programYear: 1,
    });
    server.create('cohort', {
      programYear: 2,
    });
    server.create('sessionType', {
      sessions: [1],
      school: 1,
    });
    server.create('sessionType', {
      sessions: [2],
      school: 1,
    });
    server.create('sessionType', {
      school: 1,
    });
    server.create('session', {
      disciplines: [1],
      offerings: [1],
      course: 1,
      sessionType: 1,
    });
    server.create('session', {
      offerings: [2],
      course: 1,
      sessionType: 2,
    });
    server.create('session', {
      offerings: [3],
      course: 2,
    });
    server.create('course', {
      disciplines: [2],
      sessions: [1,2],
      level: 1,
      school: 1,
    });
    server.create('course', {
      sessions: [3],
    });
    server.create('offering', {
      session: 1
    });
    server.create('offering', {
      session: 2
    });
    server.create('offering', {
      session: 3
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('load month calendar', function(assert) {
  let today = moment().hour(8);
  let startOfMonth = today.clone().startOf('month');
  let endOfMonth = today.clone().endOf('month').hour(22).minute(59);
  server.create('userevent', {
    user: 4136,
    name: 'start of month',
    startDate: startOfMonth.format(),
    endDate: startOfMonth.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'end of month',
    startDate: endOfMonth.format(),
    endDate: endOfMonth.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=month');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfMonth.format('h:mma') + '-' + startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
    eventInfo += endOfMonth.format('h:mma') + '-' + endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load week calendar', function(assert) {
  let today = moment().hour(8);
  let startOfWeek = today.clone().startOf('week');
  let endOfWeek = today.clone().endOf('week').hour(22).minute(59);
  server.create('userevent', {
    user: 4136,
    name: 'start of week',
    startDate: startOfWeek.format(),
    endDate: startOfWeek.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'end of week',
    startDate: endOfWeek.format(),
    endDate: endOfWeek.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfWeek.format('h:mma') + '-' + startOfWeek.clone().add(1, 'hour').format('h:mma') + ': start of week';
    eventInfo += endOfWeek.format('h:mma') + '-' + endOfWeek.clone().add(1, 'hour').format('h:mma') + ': end of week';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load day calendar', function(assert) {
  let today = moment().hour(8);
  let tomorow = today.clone().add(1, 'day');
  let yesterday = today.clone().subtract(1, 'day');
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'tomorow',
    startDate: tomorow.format(),
    endDate: tomorow.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'yesterday',
    startDate: yesterday.format(),
    endDate: yesterday.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=day');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 1);
    let eventInfo = '';
    eventInfo += today.format('h:mma') + '-' + today.clone().add(1, 'hour').format('h:mma') + ': today';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('click month day number and go to day', function(assert) {
  let aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'start of month',
    startDate: aDayInTheMonth.format(),
    endDate: aDayInTheMonth.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=month');
  andThen(function() {
    let dayOfMonth = aDayInTheMonth.date();
    let link = find('.day a').filter(function(){
      return parseInt($(this).text()) === dayOfMonth;
    }).eq(0);
    click(link).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&showCalendar=true&view=day');
    });
  });
});

test('click week day title and go to day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=week');
  andThen(function() {
    let dayOfWeek = today.day();
    click(find('.week-titles a').eq(dayOfWeek)).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.format('YYYY-MM-DD') + '&showCalendar=true&view=day');
    });
  });
});

test('click forward on a day goes to next day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&showCalendar=true&view=day');
    });
  });
});

test('click forward on a week goes to next week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'week').format('YYYY-MM-DD') + '&showCalendar=true');
    });
  });
});

test('click forward on a month goes to next month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&showCalendar=true&view=month');
    });
  });
});

test('click back on a day goes to previous day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&showCalendar=true&view=day');
    });
  });
});

test('click back on a week goes to previous week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'week').format('YYYY-MM-DD') + '&showCalendar=true');
    });
  });
});

test('click back on a month goes to previous month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?showCalendar=true&view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&showCalendar=true&view=month');
    });
  });
});

test('show user events', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
  });
});

let chooseSchoolEvents = function(){
  andThen(function(){
    return click(find('.togglemyschedule span'));    
  });
};
test('show school events', function(assert) {
  let today = moment().hour(8);
  server.create('schoolevent', {
    school: 1,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('schoolevent', {
    school: 1,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  chooseSchoolEvents();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
  });
});

let showFilters = function(){
  andThen(function(){
    return click(find('.showfilters span'));    
  });
};
let pickTopic = function(i) {
  let topics = find('.topicfilter');
  return click(find('li', topics).eq(i));
};

test('test topic filter', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickTopic(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 1);
    });
    
  });
  andThen(function() {
    pickTopic(1).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    pickTopic(0).then(() => {
      pickTopic(1).then(() => {
        pickTopic(2).then(() => {
          let events = find('div.event');
          assert.equal(events.length, 0);
        });
      });
    });
  });
});

let pickSessionType = function(i) {
  let types = find('.sessiontypefilter');
  return click(find('li', types).eq(i));
};

test('test session type filter', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickSessionType(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 1);
    });
    
  });
  andThen(function() {
    pickSessionType(1).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    pickSessionType(0).then(() => {
      pickSessionType(1).then(() => {
        pickSessionType(2).then(() => {
          let events = find('div.event');
          assert.equal(events.length, 0);
        });
      });
    });
  });
});

let pickCourseLevel = function(i) {
  let levels = find('.courselevelfilter');
  return click(find('li', levels).eq(i));
};
let clearCourseLevels = function() {
  let levels = find('.courselevelfilter');
  return click(find('.fa-check-square-o', levels));
};

test('test course level filter', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickCourseLevel(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourseLevels().then(() => {
      pickCourseLevel(2).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 0);
      });
    });
  });
});

let pickCohort = function(i) {
  let cohorts = find('.cohortfilter');
  return click(find('li', cohorts).eq(i));
};
let clearCohorts = function() {
  let cohorts = find('.cohortfilter');
  return click(find('.fa-check-square-o', cohorts));
};

test('test cohort filter', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickCohort(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCohorts().then(() => {
      pickCohort(1).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 0);
      });
    });
  });
});

let chooseCourseFilter = function(){
  andThen(function(){
    return click(find('.togglecoursefilters span'));    
  });
};

let pickCourse = function(i) {
  let courses = find('.coursefilter');
  return click(find('li', courses).eq(i));
};
let clearCourses = function() {
  let courses = find('.coursefilter');
  return click(find('.fa-check-square-o', courses));
};

test('test course filter', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 3
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  chooseCourseFilter();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 3);
    pickCourse(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourses().then(() => {
      pickCourse(1).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 1);
      });
    });
  });
});

test('test topic and session type filter together', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickTopic(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 1);
    });
  });
  andThen(function() {
    pickSessionType(1).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 0);
    });
  });
});

test('test course and session type filter together', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 3
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  visit('/dashboard?showCalendar=true');
  showFilters();
  chooseCourseFilter();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 3);
    pickCourse(0).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourses().then(() => {
      pickCourse(0).then(() => {
        pickSessionType(0).then(() => {
          let events = find('div.event');
          assert.equal(events.length, 1);
        });
      });
    });
  });
});

test('agenda show next seven days of events', function(assert) {
  let today = moment().hour(0).minute(0);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  let endOfTheWeek = moment().add(6, 'days');
  server.create('userevent', {
    user: 4136,
    startDate: endOfTheWeek.format(),
    endDate: endOfTheWeek.clone().add(1, 'hour').format(),
    offering: 2
  });
  let yesterday = moment().subtract(25, 'hours');
  server.create('userevent', {
    user: 4136,
    startDate: yesterday.format(),
    endDate: yesterday.clone().add(1, 'hour').format(),
    offering: 3
  });
  visit('/dashboard');
  andThen(function() {
    let events = find('tr');
    assert.equal(events.length, 2);
    assert.equal(getElementText(events.eq(0)), getText(today.format('dddd, MMMM Do, YYYY h:mma') + 'event 0'));
    assert.equal(getElementText(events.eq(1)), getText(endOfTheWeek.format('dddd, MMMM Do, YYYY h:mma') + 'event 1'));
  });
});
