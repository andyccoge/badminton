<script setup>
  import { ref, reactive, inject, provide, readonly } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalDateEditor from '../components/ModalDateEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import ContestRecord from '../components/ContestRecord.vue';
  import * as functions from '../functions.js';
  import * as Icon from '@heroicons/vue/24/outline';
  const toast = useToast();
  const swal = inject('$swal');

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    await get_dates();
  }

  // 新增/編輯打球日-------------------------------------------------------------------------
  const refModalDateEditor = ref(null);
  const dateModal_open = (target_index=-1) => {
    let target = target_index!=-1 ? Object.assign({}, dates[target_index]) : null;
    refModalDateEditor.value.set_data(target_index, target);
  }
  const change_date_data = async(target_index, data) => {
    if(refModalDateEditor.value.dataModal.index==-1){
      await get_dates();
    }else{
      let keys = Object.keys(data);
      keys.forEach(key => { dates[target_index][key] = data[key] });
    }
  }

  // 打球日列表-------------------------------------------------------------------------
  let dates = reactive([]);
  const get_dates = async() => {
    dates.splice(0, dates.length);
    let data_pool = await refFirebase.value.db_get_data('game_date', [{'orderBy':['date', 'desc']}]);
    data_pool.forEach(data => {
      dates.push(data);
    });
  }
  const date_delete = (index) => {
    if (index < 0 && index > dates.length) { return; }
    swal({
      title: '確定刪除此打球日？',
      text: "刪除相關場地、人員、比賽紀錄顯示可能會有問題",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        await refFirebase.value.db_delete_data('game_date', dates[index].id)
        dates.splice(index, 1);
      }
    });
  }

  // 比賽紀錄-------------------------------------------------------------------------
  const game_date_id = ref('');
  provide('game_date_id', game_date_id);

  let refContestRecord = ref(null);
  let modal_open_contest_record = ref(false);
  let contest_record = reactive([]);
  provide('modal_open_contest_record', modal_open_contest_record);
  provide('contest_record', readonly(contest_record));
  const get_contest_record = async(date_id) => {
    game_date_id.value  = date_id;
    await refContestRecord.value.init_data();
    modal_open_contest_record.value = true;
  }
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalDateEditor @change_data="change_date_data" :dates="dates" ref="refModalDateEditor"></ModalDateEditor>
  <ContestRecord ref="refContestRecord"></ContestRecord>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">打球日管理</h1>
    <div class="mt-2">
      <button class="flex items-center font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="dateModal_open(-1)">
        <span class="mr-2">新增</span>
        <Icon.PlusCircleIcon class="h-5 w-5 text-white"></Icon.PlusCircleIcon>
      </button>
    </div>
    <div class="table_container">
      <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg sm:shadow-lg">
        <thead class="text-white">
          <tr v-if="dates.length==0"
              class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
            <th class="border-grey-light border p-2 sm:border-0" style="width: 100px;">序號</th>
            <th class="border-grey-light border p-2 sm:border-0 w_250px">ID</th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">日期時間</span></th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">地點</span></th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">操作</span></th>
          </tr>
          <tr v-for="(date, index) in dates"
              class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
            <th class="border-grey-light border p-2 sm:border-0" style="width: 100px;">序號</th>
            <th class="border-grey-light border p-2 sm:border-0 w_250px">ID</th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">日期時間</span></th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">地點</span></th>
            <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">操作</span></th>
          </tr>
        </thead>
        <tbody class="flex-1 sm:flex-none">
          <tr v-for="(date, index) in dates"
            class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
            <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
            <td class="border-grey-light border p-2">
              <div class="flex items-center">
                <a class="text-blue-500" :href="'/pages/setting_date_detail.html?date='+date.id">
                  <span v-text="date.id"></span>
                </a>
                <button @click="functions.copy_text(date.id)">
                  <Icon.DocumentDuplicateIcon class="w-5 h-5 text-yellow-500"></Icon.DocumentDuplicateIcon>
                </button>
              </div>
            </td>
            <td class="border-grey-light border p-2"><span v-text="functions.stamp_to_time(date.date)"></span></td>
            <td class="border-grey-light border p-2"><span v-text="date.location"></span></td>
            <td class="border-grey-light border p-1">
              <div class="sm:flex block justify-around mt-0.5 flex-wrap">
                <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                        @click="dateModal_open(index)">
                  <Icon.PencilSquareIcon class="h-5 w-5 text-white"></Icon.PencilSquareIcon>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-purple-500 border-2 border-purple-700"
                        @click="functions.window_open('/pages/setting_date_detail.html?date='+date.id)">
                  <Icon.Cog8ToothIcon class="h-5 w-5 text-white"></Icon.Cog8ToothIcon>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700" @click="functions.window_open('/pages/court_manage.html?date='+date.id)">
                  <Icon.Squares2X2Icon class="h-5 w-5 text-white"></Icon.Squares2X2Icon>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700" @click="get_contest_record(date.id)">
                  <Icon.TableCellsIcon class="h-5 w-5 text-white"></Icon.TableCellsIcon>
                </button>
                <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                        @click="date_delete(index)">
                  <Icon.TrashIcon class="h-5 w-5 text-white"></Icon.TrashIcon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
  @import url("../assets/table.css");

  .w_250px{
    width: auto;
  }
  @media (min-width: 480px) {
    .w_250px{
      width: 250px;
    }
  }
</style>