<template>
  <div id="app">
   <peer-view/>
  </div>
</template>

<script>
import peerView from "@/views/peer.vue"
import {mapActions} from 'vuex'
export default {
  components:{peerView},
  created(){
    this.peer_init()
  },
  methods: {      
    ...mapActions([
      'peer_init',
    ])    
  },
}
</script>

<style lang="sass">
html
  background-color: black
  color: #3AE866
  font-family: "Courier", "Avenir", Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
#app
  font-family: "Courier", "Avenir", Helvetica, Arial, sans-serif
a
  color:'orange'
</style>
