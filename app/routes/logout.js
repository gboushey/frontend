import Ember from 'ember';
import ajax from 'ic-ajax';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';

const { inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
  flashMessages: service(),
  beforeModel(){
    let logoutUrl = '/auth/logout';
    return ajax(logoutUrl).then(response => {
      const session = this.get('session');
      if(session.isAuthenticated){
        session.invalidate();
      }
      if(response.status === 'redirect'){
        window.location.replace(response.logoutUrl);
      } else {
        this.get('flashMessages').success('auth.confirmLogout');
        this.transitionTo('login');
      }
      return false;
    });
  }
});
