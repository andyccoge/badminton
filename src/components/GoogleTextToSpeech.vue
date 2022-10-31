<script setup>
  /* 載入設定 */
  import { google_text_to_speech_url } from '../../db.config.js';
  import axios from 'axios';

  const text_to_speech = async(text) => {
    // console.log(text);
    let resp = await axios.post(google_text_to_speech_url, {
      text: text,
    });
    console.log(resp.status);
    console.log(resp.data);
  }
</script>

<template>
  <button class="btn" @click="text_to_speech('請你好，Wells，上場地A')">聲音</button>
</template>

<style scoped></style>