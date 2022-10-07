<script setup>
  import { ref, reactive, inject } from 'vue';
  import * as firebase from '../firebase.js';
  import { useToast } from "vue-toastification";
  import BodyBlock from '../components/BodyBlock.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalDate from '../components/ModalDate.vue';
  import NavSetting from '../components/NavSetting.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');
  let body_block_show = ref(false);

  // 資料庫初始化-------------------------------------------------------------------------
  const sign_in_success = async() => {
    await get_dates();
  }

  // 新增/編輯打球日-------------------------------------------------------------------------
  const refModalDate = ref(null);
  const dateModal_open = (target_index=-1) => {
    let target = target_index!=-1 ? Object.assign({}, dates[target_index]) : null;
    refModalDate.value.set_data(target_index, target);
  }
  const change_date_data = (target_index, data) => {
    if(refModalDate.value.dataModal.index==-1){
      dates.unshift(data);
    }else{
      let keys = Object.keys(data);
      keys.forEach(key => { dates[target_index][key] = data[key] });
    }
  }

  // 打球日列表-------------------------------------------------------------------------
  let dates = reactive([]);
  const get_dates = async() => {
    dates.splice(0, dates.length);
    let data_pool = await firebase.get_db_data('game_date');
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
        body_block_show.value = true;
        await firebase.delete_data('game_date', dates[index].id)
        dates.splice(index, 1);
        body_block_show.value = false;
      }
    });
  }
</script>

<template>
  <BodyBlock :show="body_block_show"></BodyBlock>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalDate @change_data="change_date_data" ref="refModalDate"></ModalDate>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold" @click="gg">打球日管理</h1>
    <div class="mt-2">
      <button class="flex items-center font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="dateModal_open(-1)">
        <span class="mr-2">新增</span>
        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
    <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg mb-5">
      <thead class="text-white">
        <tr v-for="(date, index) in dates"
            class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
          <th class="border-grey-light border p-2 sm:border-0" style="width: 100px;">序號</th>
          <th class="border-grey-light border p-2 sm:border-0">日期時間</th>
          <th class="border-grey-light border p-2 sm:border-0">地點</th>
          <th class="border-grey-light border p-2 sm:border-0">操作</th>
        </tr>
      </thead>
      <tbody class="flex-1 sm:flex-none">
        <tr v-for="(date, index) in dates"
          class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
          <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
          <td class="border-grey-light border p-2">
              <a class="text-blue-500" href="###" @click="dateModal_open(index)"><span v-text="functions.stamp_to_time(date.date)"></span></a>
          </td>
          <td class="border-grey-light border p-2"><span v-text="date.location"></span></td>
          <td class="border-grey-light border p-1">
            <div class="sm:flex block justify-around mt-0.5">
              <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                      @click="dateModal_open(index)">
                <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700"
                      @click="dateModal_open(index)">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" data-v-e331057f=""><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" data-v-e331057f=""></path></svg>
              </button>
              <button class="sm:mr-0 mr-2 rounded bg-green-500 border-2 border-green-700"
                      @click="dateModal_open(index)">
                <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </button>
              <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                      @click="date_delete(index)">
                <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  td{
    min-height: 42px;
  }
  @media (min-width: 480px) {
    table {
      display: inline-table !important;
    }

    thead tr:not(:first-child) {
      display: none;
    }

    td{
      min-height: unset;
    }
  }
</style>