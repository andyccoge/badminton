<script setup>
  import { ref, reactive, inject, provide} from 'vue';
  // import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalPoints from '../components/ModalPoints.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  import * as Icon from '@heroicons/vue/24/outline';
  // const toast = useToast();
  const swal = inject('$swal');

  const game_date_id = inject('game_date_id');
  
  const emit = defineEmits(['sync_contest_record', 'set_users_played_num']);

  const modal_open = inject('modal_open_contest_record') ? inject('modal_open_contest_record') : ref(false);

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
  }

  const users = reactive([]);
  provide('users', users);
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
    await get_contest_record_data();
    refFirebase.value.set_body_block_show_long(false);
  }
  const get_contest_record_data = async() => {
    contest_record.splice(0, contest_record.length);
    let contest_record_data = await refFirebase.value.db_get_data('game_records', [['game_date_id', '==', game_date_id.value], {'orderBy':['create_time', 'desc']}]);
    for (let x = 0; x < contest_record_data.length; x++) {
      contest_record.push(contest_record_data[x]);
    }
    emit('sync_contest_record');
    emit('set_users_played_num');
    /* 更新完賽數 */
  }

  // 分數面板-------------------------------------------------------------------------
  const refModalPoints = ref(null);
  const open_modal_poists = (court_index) => {
    refModalPoints.value.set_modal_data(court_index, court_index, contest_record[court_index], contest_record[court_index].id);
  }
  const update_court_points = (court_index, repeat_index, points) => {
    contest_record[court_index].game_points = points;
  }

  const record_delete = (index) => {
    if (index < 0 && index > dates.length) { return; }
    swal({
      title: '確定刪除此比賽紀錄？',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        await refFirebase.value.db_delete_data('game_records', contest_record[index].id)
        contest_record.splice(index, 1);
        emit('sync_contest_record');
      }
    });
  }

  // 外部操作-------------------------------------------------------------------------
  const get_data = () => {
    return {'users':users, 'contest_record':contest_record};
  }
  const add_record = async(contest_data) => {
    let add_result = await refFirebase.value.db_add_data('game_records', {...contest_data, game_date_id:game_date_id.value});
    contest_data = add_result ? add_result : contest_data;
    contest_record.unshift(contest_data);
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
  });

  const overflow = ref('unset');
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <!-- 比賽紀錄 -->
  <modal :show="modal_open" :click_bg_close="false" :overflow="overflow" @close="modal_open=false">
    <template #header>
      <h3 class="font-bold text-xl flex items-center">
        比賽紀錄
        <button class="ml-3" @click="get_contest_record_data">
          <Icon.ArrowPathIcon class="h-5 w-5 text-black"></Icon.ArrowPathIcon>
        </button>
      </h3>
    </template>
    <template #body>
      <div class="table_container" style="max-width: 80vw; overflow: scroll;">
        <table class="w-full sm:bg-white sm:shadow-lg">
          <thead class="text-white">
            <tr class="bg-teal-400 sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
              <th class="border-grey-light border px-2 py-1 sm:border-0 text-right">序號</th>
              <th class="border-grey-light border px-2 py-1 sm:border-0">隊伍1</th>
              <th class="border-grey-light border px-2 py-1 sm:border-0"><span class="col_point">比數</span></th>
              <th class="border-grey-light border px-2 py-1 sm:border-0">隊伍2</th>
              <th class="border-grey-light border px-2 py-1 sm:border-0 text-right"><span class="col_time">時間</span></th>
              <th class="border-grey-light border px-2 py-1 sm:border-0"><span class="line-clampx-2 py-1 sm:line-clamp-none">操作</span></th>
            </tr>
          </thead>
          <tbody class="sm:flex-none">
            <tr v-for="(record, index) in contest_record"
                class="sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
              <td class="border-grey-light border px-2 py-1 text-right"><span v-text="index+1"></span></td>
              <td class="border-grey-light border px-2 py-1 text-center">
                <div class="flex flex-wrap justify-center">
                  <span v-text="functions.get_user_name(users, record.users[0][0])"></span>
                  <span v-if="record.users[0][0]!=0 && record.users[0][1]!=0">、</span>
                  <span v-text="functions.get_user_name(users, record.users[0][1])"></span>
                </div>
              </td>
              <td class="border-grey-light border px-2 py-1 text-center">
                <span class="col_point">
                  <a href="###" class="text-blue-500" @click="open_modal_poists(index)">
                    <span v-text="record.game_points[0]"></span>：<span v-text="record.game_points[1]"></span>
                  </a>
                </span>
              </td>
              <td class="border-grey-light border px-2 py-1 text-center">
                <div class="flex flex-wrap justify-center">
                  <span v-text="functions.get_user_name(users, record.users[1][0])"></span>
                  <span v-if="record.users[1][0]!=0 && record.users[1][1]!=0">、</span>
                  <span v-text="functions.get_user_name(users, record.users[1][1])"></span>
                </div>
              </td>
              <td class="border-grey-light border px-2 py-1 text-right">
                <span class="col_time" v-text="game_time(record.time)"></span>
              </td>
              <td class="border-grey-light border px-2 py-1 ">
                <div class="oper_point sm:flex block justify-around mt-0.5 flex-wrap">
                  <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                          @click="open_modal_poists(index)">
                    <Icon.PencilSquareIcon class="h-5 w-5 text-white"></Icon.PencilSquareIcon>
                  </button>
                  <button class="sm:mr-0 mr-0 rounded bg-red-500 border-2 border-red-700"
                          @click="record_delete(index)">
                    <Icon.TrashIcon class="h-5 w-5 text-white"></Icon.TrashIcon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template #footer>
      <div class="text-right">(新比賽顯示於最上方)</div>
    </template>
  </modal>
  <ModalPoints @update_court_points="update_court_points"  ref="refModalPoints"></ModalPoints>
</template>

<style scoped>
  @import url("../assets/table.css");

  html, body {
    height: 100%;
  }
  .table_container{
    max-height: 65vh;
  }
  .col_point{
    display: inline-block;
    width: 65px;
    text-align: center;
  }
  .col_time{
    display: inline-block;
    width: 55px;
  }
  .oper_point{
    min-width: 56px;
    text-align: center;
  }
  @media (max-width: 479px) {
    table{
      max-width: calc(100vw - 72px);
    }
  }
</style>