import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Course - Publish', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('cohort', {
      courses: [1],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check published course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    cohorts: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    publishedAsTbd: true,
    cohorts: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Course'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });
});

test('check scheduled course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Course'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });
});

test('check draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'Mark as Scheduled'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });
});

test('check publish draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');


  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    click(selector);
    click(publish);

    andThen(function(){
      assert.equal(getElementText(find(selector)), getText('Published'));
    });
  });
});

test('check schedule draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(2)`;
    click(selector);
    click(schedule);

    andThen(function(){
      assert.equal(getElementText(selector), getText('Scheduled'));
    });
  });
});

test('check publish scheduled course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    click(selector);
    click(publish);

    andThen(function(){
      assert.equal(getElementText(selector), getText('Published'));
    });
  });
});

test('check unpublish scheduled course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    click(selector);
    click(unPublish);

    andThen(function(){
      assert.equal(getElementText(selector), getText('Not Published'));
    });
  });
});

test('check schedule published course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(1)`;
    click(selector);
    click(schedule);

    andThen(function(){
      assert.equal(getElementText(selector), getText('Scheduled'));
    });
  });
});

test('check unpublish published course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    click(selector);
    click(unPublish);

    andThen(function(){
      assert.equal(getElementText(selector), getText('Not Published'));
    });
  });
});
