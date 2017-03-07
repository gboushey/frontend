import Ember from 'ember';
import C3Chart from './c3-chart-base';

const { computed, $, isPresent} = Ember;

export default C3Chart.extend({
  dataWithType: computed('data', function(){
    let data = this.get('data');
    if (isPresent(data)) {
      data = $.extend({}, data);
      data.type = 'bar';
    }

    return data;
  }),
  classNames: ['chart-bar'],
  layoutName: 'components/c3-chart-base',
  data: null,
  bar: true,
});
