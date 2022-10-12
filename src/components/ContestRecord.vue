<script setup>
  import { ref, reactive, inject, watch, onMounted} from 'vue';
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import Modal from '../components/Modal.vue';

  const game_date_id = inject('game_date_id');

  const modal_open = inject('modal_open_contest_record') ? inject('modal_open_contest_record') : ref(false);

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
  }

  const users = reactive([]);
  const contest_record = reactive([]);
  const init_data = async() => {
    refFirebase.value.set_body_block_show_long(true);
    /*取得人員資料*/
    users.splice(0, users.length);
    let user_data = await refFirebase.value.get_game_date_users(game_date_id.value);
    for (let i = 0; i < user_data.length; i++) {
      users.push(user_data[i]);
    }

    /*取得比賽資料*/
    contest_record.splice(0, contest_record.length);
    let contest_record_data = await refFirebase.value.db_get_data('game_records', [['game_date_id', '==', game_date_id.value], {'orderBy':['create_time', 'desc']}]);
    for (let x = 0; x < contest_record_data.length; x++) {
      contest_record.push(contest_record_data[x]);
    }
    refFirebase.value.set_body_block_show_long(false);
  }
  const get_data = () => {
    return {'users':users, 'contest_record':contest_record};
  }
  const add_record = async(contest_data) => {
    contest_record.unshift(contest_data);
    await refFirebase.value.db_add_data('game_records', {...contest_data, game_date_id:game_date_id.value});
  }

  const get_user_name = (user_id) => {
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      if(element.id==user_id){ return element.nick ? element.nick : element.name; };
    }
  }

  const game_time = (time) => {
    if(time==0){ return '00：00'; }
    else{
      let minute = Math.floor((time / 60)).toFixed(0);
      let second = (time % 60).toFixed(0);
      return minute.padStart(2, 0) + '：' + second.padStart(2, 0);
    }
  };

  defineExpose({
    init_data,
    get_data,
    add_record,
  })
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>

  <!-- 比賽紀錄 -->
  <modal :show="modal_open" :click_bg_close="false" @close="modal_open=false">
    <template #header>
      <h3 class="font-bold text-xl">比賽紀錄</h3>
    </template>
    <template #body>
      <div class="table_container">
        <table class="w-full flex flex-row flex-no-wrap sm:bg-white sm:shadow-lg">
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
      </div>
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