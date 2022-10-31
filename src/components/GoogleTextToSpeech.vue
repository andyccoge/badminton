<script setup>
  import { ref } from 'vue';
  /* 載入設定 */
  import { google_text_to_speech_url } from '../../db.config.js';
  import axios from 'axios';

  const audio_text = ref('');
  const audio_url = ref('');

  const text_to_speech = async(text) => {
    // console.log(text);
    if(audio_text.value!=text){
      var bodyFormData = new FormData();
      bodyFormData.append('text', text);
      try {
        let resp = await axios({
          method: 'post',
          url: google_text_to_speech_url,
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
        });
        // console.log(resp.data);
        if(resp.data.code){
          audio_text.value = text;
          audio_url.value = resp.data.msg;
        }
      } catch (error) {
        console.log(error);
      }
    }
    if(audio_url.value){
      var audio = new Audio('//' + audio_url.value);
      audio.play();
    }
  }

  defineExpose({
    text_to_speech, /* 傳入文字，發出聲音 */
  });
</script>

<template>
</template>

<style scoped></style>