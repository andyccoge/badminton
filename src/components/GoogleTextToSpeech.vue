<script setup>
  import { ref } from 'vue';
  import { useToast } from "vue-toastification";
  import * as functions from '../functions.js';
  /* 載入設定 */
  import { google_text_to_speech_url } from '../../db.config.js';
  import axios from 'axios';
  const toast = useToast();

  const audio_text = ref('');
  const audio_url = ref('');
  const use_sound_defult = localStorage.getItem('use_sound_defult') ? localStorage.getItem('use_sound_defult') : 'true';
  const use_sound = ref(use_sound_defult);

  const toggle_use_sound = () => {
    let new_use_sound = use_sound.value=='true' ? 'false' : 'true';
    // console.log(new_use_sound);
    use_sound.value = new_use_sound;
    localStorage.setItem('use_sound_defult', new_use_sound);
  }

  const court_users_to_speech = async(users, court) => {
    let text = '請';
    court.users.forEach(group => {
      group.forEach(user_id => {
        text += functions.get_user_name(users, user_id) + '，'
      });
    });
    text += '上' + court.name;
    // console.log(text);
    text_to_speech(text);
  }

  const text_to_speech = async(text) => {
    if(use_sound.value!='true'){ return; }
    console.log(text);
    if(!text){
      toast.warning("請提供語音內容");
      return;
    }
    console.log(audio_text.value!=text);
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
        console.log(resp.data);
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
    use_sound, /* 當前使用語音狀態 */
    toggle_use_sound, /* 控制是否使用語音功能 */
    court_users_to_speech, /*依給定所有人員(取得名稱用)及場地產生人員語音*/
    text_to_speech, /* 傳入文字，發出聲音 */
  });
</script>

<template>
</template>

<style scoped></style>