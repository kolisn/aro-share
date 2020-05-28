<template>
    <div>
        My ID {{getHost.id}}
        <br/>
        Peer ID {{getPeer.id==null?'DISCONNECTED':getPeer.id}}
    <br/>
        Connect to peer?  <input v-model="connect_id" type="text" class="shadow bg-gray-800   border border-red-500 rounded py-2 px-3 text-green mb-3 leading-tight focus:outline-none focus:shadow-outline" /> 
        <button @click="connect()" class="bg-gray-800 hover:bg-gray-700 text-green font-bold py-2 px-4 rounded">Connect</button>
        <button @click="connectSend()" class="bg-gray-800 hover:bg-gray-700 text-green font-bold py-2 px-4 rounded">Connect + send selected</button>
    <label for="myfile">Select a file:</label><input v-on:change="setSelFile" type="file" id="myfile" name="myfile">
    <span v-if="getPeer.errors.has">
        <div v-for="(error,index) in getPeer.errors.list" :key="index" class="flex items-center bg-blue-500 text-white text-sm font-bold px-4 py-3" role="alert">
             <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
        <p>{{error}}</p>
        </div>
    </span>
    <ul>
        <li v-for="send in getTransfers" :key="send.id">
          <strong>{{send.type}}</strong> {{send.id.substring(0,3)}} {{send.obj.file.name}} {{send.sent}}/{{send.obj.file.size}} ({{send.progress}}%) <progress id="file" :value="send.progress" max="100"> 32% </progress>
          <button class="rounded mx-1" @click="pause_transfer({id:send.id})">Pause</button>
          <button class="rounded mx-1" @click="resume_transfer({id:send.id})">Resume</button>
          <button class="rounded mx-1" @click="stop_transfer({id:send.id})">Stop</button>
          <button class="rounded mx-1" @click="play_transfer({id:send.id})">Play</button>       
          <video width="320" height="240" :src="send.outputURL" v-if="send.play">
              <source :src="send.outputURL" :type="send.output.type"/>
                Video not supported
          </video> 
          <a :href="send.outputURL" v-if="send.play">Media Link</a>                 
        </li>
    </ul>
    </div>


</template>

<script>
import { mapGetters,mapActions } from "vuex";
export default{

    computed:{
        ...mapGetters(['getHost','getPeer','getTransfers'])
    },
    data(){
        return{
            connect_id:"",
            selFile:undefined
        }
    },
    methods: {
        ...mapActions(['connect_peer','connect_send_peer','pause_transfer','resume_transfer','stop_transfer','play_transfer']),
        setSelFile(x){
            this.selFile = x
        },        
        connect() {
            console.log("Connecting to",this.connect_id)
            this.connect_peer(this.connect_id)
        },
        connectSend() {
            console.log("Connecting to",this.connect_id)
            this.connect_send_peer({id:this.connect_id,file:this.selFile})
        }
    }
}

</script>

<style lang="sass" scoped>

</style>