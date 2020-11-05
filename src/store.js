import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {

        host: {
            peer: {},
            id: null
        },
        peer: {
            conn: {},
            id: null,
            errors: {
                has: false,
                list: []
            }
        },
        transfers: []
    },
    getters: {
        getHost(state) {
            return state.host
        },
        getPeer(state) {
            return state.peer
        },
        getTransfers(state) {
            return state.transfers
        }

    },
    mutations: {
        setHostId: function(state, payload) {        
            state.host.id = payload;
        },
        setError: function(state, payload) {
            if (payload.length > 0) {
                state.peer.errors.has = true;
            } else {
                state.peer.errors.has = false;
            }
            state.peer.errors.list = payload
        },
        setPeer: function(state, payload) {
            state.peer.conn = payload
            state.peer.id = payload.peer
        },
        setPeerServer: function(state, payload) {        
            state.host.peer = new Vue.prototype.Peer(payload)
        },
        setNewSend: function(state, payload) {
            state.transfers.push({ type: "SEND", id: payload.send_id, obj: payload, progress: 0.0, sent: 0.0, handle: payload.handle, play: false, output: new Blob(), outputURL: '' })
        },
        setNewRec: function(state, payload) {       
            state.transfers.push({ type: "RECEIVE", id: payload.send_id, obj: payload.obj, progress: 0.0, sent: 0.0, handle: payload.handle, play: false, output: new Blob(), outputURL: '' })
        },
        setSendProgress: function(state, payload) {
            let thisSend = state.transfers.find((send) => {            
                return send.id == payload.id
            })
            if (thisSend) {           
                thisSend.progress = payload.progress
                thisSend.sent = payload.sent
            }
        },
        setPauseTransfer: function(state, payload) {
            //find transfer to pause
            let thisSend = state.transfers.find((send) => {
                return send.id == payload.id
            })
            
            if (thisSend) {             
                thisSend.handle.pause()
            }

        },
        setStopTransfer: function(state, payload) { 
            //find transfer to cancel
            let thisSend = state.transfers.find((send) => {         
                return send.id == payload.id
            })

            if (thisSend) {          
                thisSend.handle.cancel()
                thisSend.type = "CANCELLED"
                thisSend.progress = 0.0
                thisSend.sent = 0.0
            }

        },
        setResumeTransfer: function(state, payload) {         
            //find transfer to resume
            let thisSend = state.transfers.find((send) => {
                return send.id == payload.id
            })
            if (thisSend) {          
                thisSend.handle.resume()
            }

        },
        setPlayTransfer: function(state, payload) {    
            //find transfer to play
            let thisSend = state.transfers.find((send) => {          
                return send.id == payload.id
            })
            if (thisSend) {            
                thisSend.play = true
            }

        },
        storeOutput: function(state, payload) {
            //find transfer to play
            let thisSend = state.transfers.find((send) => {
                return send.id == payload.id
            })
            if (thisSend) {
                thisSend.output = payload.output
                thisSend.outputURL = window.URL.createObjectURL(payload.output);
            }
        }

    },
    actions: {
        play_transfer: function({ commit }, payload) {
            commit('setPlayTransfer', payload)
        },
        stop_transfer: function({ commit }, payload) {
            commit('setStopTransfer', payload)
        },
        resume_transfer: function({ commit }, payload) {
            commit('setResumeTransfer', payload)
        },
        pause_transfer: function({ commit }, payload) {
            commit('setPauseTransfer', payload)
        },
        connect_send_peer: function({ commit, state }, payload) {
            let conn = state.host.peer.connect(payload.id);
            conn.on('open', function(otherID) {
                commit('setError', [])
                    // here you have conn.id
                commit('setPeer', conn)
        
                let file = payload.file.srcElement.files[0]
                let newSendID = Vue.uuidv4();
                let newSendObj = {
                    peer: payload.id,
                    send_id: newSendID,
                    file: { name: file.name, size: file.size },
                    handle: null
                }
                conn.send({ type: "SEND", id: newSendID, obj: { peer: payload.id, send_id: newSendID, file: { name: file.name, size: file.size } } });          

                Vue.prototype.PeerSend(conn, file)
                    .on('accept', function() {
                        newSendObj.handle = this
                        commit('setNewSend', newSendObj)
                    })
                    .on('progress', function(bytesSent) {

                        let curProg = Math.ceil(bytesSent / file.size * 100)
                        commit('setSendProgress', { id: newSendObj.send_id, progress: curProg, sent: bytesSent })
                    })


            });
            conn.on('error', function(err) {
                console.error("Connection err", err)
            })

        },
        connect_peer: function({ commit, state }, payload) {       
            let conn = state.host.peer.connect(payload);
            conn.on('open', function(otherID) {
                commit('setError', [])
                    // here you have conn.id
                commit('setPeer', conn)
                conn.send('hi! im connected', otherID);
            });
            conn.on('error', function(err) {
                console.error("Connection err", err)
            })

        },
        peer_init: function({ commit, state }) {        
            commit('setPeerServer', {
                host: '', /* Set your HOST here, peerjs backend can be hosted on Heroku very easily */
                secure: true,
                port: 443,
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ],
                path: '/'
            })

            state.host.peer.on('open', function(id) {           
                commit("setHostId", id)
            });
            state.host.peer.on('error', function(err) {           
                commit('setError', [err])
            });
            state.host.peer.on('connection', function(conn) {              
                commit('setPeer', conn)
                let sendRecID = "x";
                let sendObj = {};
                conn.on('data', function(data) {                       
                    if (data.type == "SEND") {
                        sendRecID = data.id
                        sendObj = data.obj
                    }
                });
                conn.on("open", function() {
                    Vue.prototype.PeerReceive(conn)
                        .on('incoming', function(file) {
                            commit('setNewRec', { send_id: sendRecID, obj: sendObj, handle: this })
                            this.accept(file) /* Auto-accept transfer */
                        })
                        .on('cancel', function() {
                            commit('setStopTransfer', {
                                id: sendRecID
                            })
                        })
                        .on('progress', function(file, bytesReceived) {
                            let curProg = Math.ceil(bytesReceived / file.size * 100)

                            commit('setSendProgress', { id: sendObj.send_id, progress: curProg, sent: bytesReceived })
                        })
                        .on('complete', function(file) {
                            let outblock = new Blob(file.data, { type: file.type })
                            commit('storeOutput', { id: sendRecID, output: outblock })                    
                            if (outblock.type == "text/plain") {
                                var reader = new FileReader();
                                reader.onload = function() {
                                    console.log("Reader result", reader.result)
                                }
                                reader.readAsText(outblock);
                            } else {
                                Vue.prototype.SaveAs(outblock, sendObj.file.name)
                            }
                        })
                })
            });
        }
    }
});
