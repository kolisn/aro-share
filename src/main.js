import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import './assets/tailwind.css'
import Peer from 'peerjs';
import * as send from 'peer-file/send'
import * as receive from 'peer-file/receive'
import { saveAs } from 'file-saver';
import helpers from './plugins/helpers.js'
Vue.use(helpers)
Vue.prototype.Peer = Peer;
Vue.prototype.PeerSend = send;
Vue.prototype.PeerReceive = receive;
Vue.prototype.SaveAs = saveAs
Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");