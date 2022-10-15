<script setup>
  import { ref, reactive, inject, provide, readonly } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalDateEditor from '../components/ModalDateEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import ContestRecord from '../components/ContestRecord.vue';
  import * as functions from '../functions.js';
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
  <ModalDateEditor @change_data="change_date_data" ref="refModalDateEditor"></ModalDateEditor>
  <ContestRecord ref="refContestRecord"></ContestRecord>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">打球日管理</h1>
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
                <a class="text-blue-500" :href="'/pages/setting_date_detail.html?date='+date.id" target="_blank">
                  <span v-text="date.id"></span>
                </a>
                <button @click="functions.copy_text(date.id)">
                  <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </button>
              </div>
            </td>
            <td class="border-grey-light border p-2"><span v-text="functions.stamp_to_time(date.date)"></span></td>
            <td class="border-grey-light border p-2"><span v-text="date.location"></span></td>
            <td class="border-grey-light border p-1">
              <div class="sm:flex block justify-around mt-0.5 flex-wrap">
                <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                        @click="dateModal_open(index)">
                  <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-purple-500 border-2 border-purple-700"
                        @click="functions.window_open('/pages/setting_date_detail.html?date='+date.id)">
                  <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700" @click="functions.window_open('/pages/court_manage.html?date='+date.id)">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700" @click="get_contest_record(date.id)">
                    <svg  class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
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