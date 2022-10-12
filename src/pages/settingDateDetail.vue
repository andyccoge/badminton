<script setup>
  import { ref, reactive, inject, provide, readonly } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import * as functions from '../functions.js';
  import ModalDateEditor from '../components/ModalDateEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import CourtEditor from '../components/CourtEditor.vue';
  import AddDateUser from '../components/AddDateUser.vue';
  const toast = useToast();
  const swal = inject('$swal');

  const game_date_id = ref(functions.get_href_attr('date'));
  provide('game_date_id', game_date_id);

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    await get_dates();

    /* 取得場地資料 */
    courts.splice(0, courts.length);
    let courts_data = await refFirebase.value.db_get_data('game_date_courts', [['game_date_id', '==', game_date_id.value], {'orderBy':['create_time', 'asc']}]);
    for (let x = 0; x < courts_data.length; x++) {
      courts.push(courts_data[x]);
    }
  }

  // 新增/編輯打球日-------------------------------------------------------------------------
  const refModalDateEditor = ref(null);
  const dateModal_open = (target_index=-1) => {
    let target = target_index!=-1 ? Object.assign({}, dates[target_index]) : null;
    refModalDateEditor.value.set_data(target_index, target);
  }
  const change_date_data = async(target_index, data) => {
    let keys = Object.keys(data);
    keys.forEach(key => { dates[target_index][key] = data[key] });
  }

  // 打球日列表(打球日資料)-------------------------------------------------------------------------
  let dates = reactive([]);
  const get_dates = async() => {
    dates.splice(0, dates.length);
    let data_pool = await refFirebase.value.db_get_data('game_date', [
      ['id', '==', game_date_id.value]
    ]);
    if(data_pool.length==0){
      swal({
        title: '無此打球日',
        text: "連結有誤，請從「打球日管理」取得正確網址",
        icon: 'warning',
        confirmButtonText: '離開',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        location.href = '/pages/setting_date.html';
      });
    }

    data_pool.forEach(data => {
      dates.push(data);
    });
  }

  // 打球日場地-------------------------------------------------------------------------
  let courts = reactive([]);
  provide('courts', readonly(courts));
  const refCourtEditor = ref(null);
  const court_eidt = (court_index) => {
    refCourtEditor.value.set_court_data(court_index);
  }
  provide('court_eidt', court_eidt);

  const change_court_data = (court_index, target) => {
    if(court_index==-1){
      courts.push(target);
    }
    else{
      const keys = Object.keys(target);
      keys.forEach(key => { courts[court_index][key] = target[key] });
    }
  }

  const courtModal_add = (num) => {
    refCourtEditor.value.courtModal_add(num);
  }
  const court_delete = async(court_index) => {
    let court = courts[court_index];
    courts.splice(court_index, 1);
    await refFirebase.value.db_delete_data('game_date_courts', court.id);
  }
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalDateEditor @change_data="change_date_data" ref="refModalDateEditor"></ModalDateEditor>
  <CourtEditor @change_court_data="change_court_data" ref="refCourtEditor"></CourtEditor>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">打球日細項</h1>
    <div class="mt-2 mb-5">
      <h3 class="text-xl font-bold">時間/地點</h3>
      <div class="table_container">
        <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg sm:shadow-lg">
          <thead class="text-white">
            <tr v-for="(date, index) in dates"
                class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
              <th class="border-grey-light border p-2 sm:border-0 w_250px">ID</th>
              <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">日期時間</span></th>
              <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">地點</span></th>
              <th class="border-grey-light border p-2 sm:border-0"><span class="line-clamp-1 sm:line-clamp-none">操作</span></th>
            </tr>
          </thead>
          <tbody class="flex-1 sm:flex-none">
            <tr v-for="(date, index) in dates"
              class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
              <td class="border-grey-light border p-2">
                <div class="flex items-center">
                  <a class="text-blue-500" href="###" @click="dateModal_open(index)">
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
                  <button class="sm:mr-0 mr-2 rounded bg-yellow-500 border-2 border-yellow-700" @click="functions.window_open('/pages/court_manage.html?date='+date.id)">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="mt-2 mb-5">
      <h3 class="text-xl font-bold flex items-center">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" data-v-e331057f=""><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" data-v-e331057f=""></path></svg>
        場地設定
      </h3>
      <div class="table_container">
        <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg sm:shadow-lg">
          <thead class="text-white">
            <tr v-for="(court, index) in courts"
                class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
              <th class="border-grey-light border p-2 sm:border-0 text-right">序號</th>
              <th class="border-grey-light border p-2 sm:border-0">場地名稱</th>
              <th class="border-grey-light border p-2 sm:border-0">類型</th>
              <th class="border-grey-light border p-2 sm:border-0">操作</th>
            </tr>
          </thead>
          <tbody class="flex-1 sm:flex-none">
            <tr v-for="(court, index) in courts" :class="[court.type==1 ?'bg-green-100' : 'bg-yellow-100']"
              class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
              <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
              <td class="border-grey-light border p-2">
                <a class="text-blue-500" href="###" @click="court_eidt(index)" v-if="court.type==1"><span v-text="court.name"></span></a>
              </td>
              <td class="border-grey-light border p-2">
                <span v-if="court.type==1">比賽</span>
                <span v-else>預備</span>
              </td>
              <td class="border-grey-light border p-1">
                <div class="sm:flex block justify-around mt-0.5 flex-wrap">
                  <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                          @click="court_eidt(index)" v-if="court.type==1">
                    <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                          @click="court_delete(index)">
                    <svg class="h-5 w-5 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="4" y1="7" x2="20" y2="7" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="container mx-auto grid grid-cols-2">
        <div class="px-1">
          <button id="show-modal" @click="courtModal_add(1)"
            class="w-full font-bold py-2 px-4 border-b-4 rounded
            bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
            新增比賽場地
          </button>
        </div>
        <div class="px-1">
          <button id="show-modal" @click="courtModal_add(0)"
                  class="w-full font-bold py-2 px-4 border-b-4 rounded
                      bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500">
            新增預備場地
          </button>
        </div>
      </div>
    </div>
    <div class="mt-2 mb-5">
      <h3 class="text-xl font-bold flex items-center">
        <svg class="h-5 w-5"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
        人員設定
      </h3>
      <AddDateUser></AddDateUser>
    </div>
  </div>
</template>

<style scoped>
  @import url("../assets/table.css");

  .w_250px{
    width: auto;
  }
  @media (min-width: 480px) {
    th{
      min-width: 100px;
    }
    .w_250px{
      width: 250px;
    }
  }
</style>