import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:courses', 'CoursesController', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
