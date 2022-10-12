<script setup>
  import { ref, inject } from 'vue';
  import Modal from '../components/Modal.vue';

  const modal_open = inject('modal_open_contest_record') ? inject('modal_open_contest_record') : ref(false);
  const contest_record = inject('contest_record');
  const get_user_name = inject('get_user_name');

  const game_time = (time) => {
    if(time==0){ return '00：00'; }
    else{
      let minute = Math.floor((time / 60)).toFixed(0);
      let second = (time % 60).toFixed(0);
      return minute.padStart(2, 0) + '：' + second.padStart(2, 0);
    }
  };
</script>

<template>
  <!-- 比賽紀錄 -->
  <modal :show="modal_open" :click_bg_close="false" @close="modal_open=false">
    <template #header>
      <h3 class="font-bold text-xl">比賽紀錄</h3>
    </template>
    <template #body>
      <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg my-5">
        <thead class="text-white">
          <tr v-for="(record, index) in contest_record"
              class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
            <th class="border-grey-light border p-2 sm:border-0 text-right">序號</th>
            <th class="border-grey-light border p-2 sm:border-0">隊伍1</th>
            <th class="border-grey-light border p-2 sm:border-0">比數</th>
            <th class="border-grey-light border p-2 sm:border-0">隊伍2</th>
            <th class="border-grey-light border p-2 sm:border-0 text-right">時間</th>
          </tr>
        </thead>
        <tbody class="flex-1 sm:flex-none">
          <tr v-for="(record, index) in contest_record"
              class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
            <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
            <td class="border-grey-light border p-2 text-center">
              <span v-text="get_user_name(record.users[0][0])"></span>
              <span v-if="record.users[0][0]!=0 && record.users[0][1]!=0">、</span>
              <span v-text="get_user_name(record.users[0][1])"></span>
            </td>
            <td class="border-grey-light border p-2 text-center">
                <span v-text="record.game_points[0]"></span>：<span v-text="record.game_points[1]"></span>
            </td>
            <td class="border-grey-light border p-2 text-center">
              <span v-text="get_user_name(record.users[1][0])"></span>
              <span v-if="record.users[1][0]!=0 && record.users[1][1]!=0">、</span>
              <span v-text="get_user_name(record.users[1][1])"></span>
            </td>
            <td class="border-grey-light border p-2 text-right"><span v-text="game_time(record.time)"></span></td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #footer>
      <div class="text-right">(新比賽顯示於最上方)</div>
    </template>
  </modal>
</template>

<style scoped>
  @import url("../assets/table.css");

  html, body {
    height: 100%;
  }

  @media (max-width: 479px) {
    table{
      max-width: calc(100vw - 72px);
    }
  }
</style>