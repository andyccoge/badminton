<script setup>
  import { ref, reactive, inject, provide } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import User from '../components/User.vue';
  const toast = useToast();
  const swal = inject('$swal');

  const game_date_id = inject('game_date_id');

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    await get_users();
    await get_game_date_users();
  } 

  // 新增/編輯人員-------------------------------------------------------------------------
  const refModalUserEditor = ref(null);
  const userModal_open = (user_index=-1) => {
    let target_user = user_index!=-1 ? Object.assign({}, date_users[user_index]) : null;
    refModalUserEditor.value.set_user(user_index, target_user);
  }
  const change_user_data = (user_index, user_data) => {
    let user_keys = Object.keys(user_data);
    user_keys.forEach(key => { date_users[user_index][key] = user_data[key] });
    get_users();
  }

  // 人員列表-------------------------------------------------------------------------
  let users = reactive([]);
  let date_users = reactive([]);
  let select_repeat_user = reactive([]);
  let users_input_data = ref('');
  const add_users = async() => {
    let data = users_input_data.value;
    data = data.split(',');
    data = data.filter((item)=>{ return item.trim() });
    if(data.length==0){ toast.warning('請輸入員名稱');return; }
    select_repeat_user.splice(0, select_repeat_user.length);
    for (let i = 0; i < data.length; i++) {
      let user_id = '';
      const d = data[i].trim();
      if(d){
        let repeat_users = await refFirebase.value.db_get_data('users', [['name', '==', d]]);
        if(repeat_users.length<2){
          if(repeat_users.length==0){
            let new_user = {name:d};
            new_user = await refFirebase.value.db_add_data('users', new_user);
            user_id = new_user.id;
          }else if(repeat_users.length==1){
            user_id = repeat_users[0].id;
          }
          await refFirebase.value.add_game_date_users(game_date_id, user_id);
        }
        else{
          select_repeat_user.push(repeat_users);
        }
      }
    }
    users_input_data.value = '';

    if(select_repeat_user.length>0){
    }
  
    await get_game_date_users();
    toast.success('設定成功');
  }
  const select_user = async(user_index) =>{
    await refFirebase.value.add_game_date_users(game_date_id, users[user_index].id);
    await get_game_date_users();
    toast.success('設定成功');
  }
  provide('select_user', select_user);

  const get_users = async() => {
    users.splice(0, users.length);
    let user_data = await refFirebase.value.db_get_data('users');
    user_data.forEach(data => {
      users.push(data);
    });
  }
  const get_game_date_users = async() => {
    date_users.splice(0, date_users.length);
    let user_data = await refFirebase.value.db_get_data('game_date_users', [['game_date_id','==', game_date_id]]);
    for (let i = 0; i < user_data.length; i++) {
      let data = user_data[i];
      let user = await refFirebase.value.db_get_data('users', [['id','==', data.user_id]]);
      user = user.length>0 ? user[0] : {};
      let date_user_id = data.id;
      data = {...data, ...user, date_user_id: date_user_id};
      date_users.push(data);
    }
    console.log(date_users)
  }

  const user_delete = (user_index) => {
    if (user_index < 0 && user_index > date_users.length) { return; }
    swal({
      title: '確定刪除此人在此打球日的紀錄嗎？',
      text: "刪除後相關比賽紀錄可能顯示會有問題",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        await refFirebase.value.db_delete_data('game_date_users', date_users[user_index].date_user_id);
        date_users.splice(user_index, 1);
      }
    });
  }
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalUserEditor @change_user_data="change_user_data" ref="refModalUserEditor"></ModalUserEditor>

  <div class="p-2">
    <h4 class="">單一設定</h4>
    <div class="mb-4">
      <template v-for="(user, user_index) in users">
        <User :user="user" :user_index="user_index"></User>
      </template>
    </div>
    <hr class="my-3">
    <h4 class="">批次設定人員(請輸入人名並以英文逗點分隔，人名間的空白及換行不會影響程式運作)</h4>
    <textarea class="w-full" rows="2" v-model="users_input_data" placeholder="陳XX, 王OO"></textarea>
    <p class="text-red-600">※此處會檢查姓名是否已存在資料庫，不存在則新增，存在則直接套用</p>
    <button @click="add_users"
            class="w-full font-bold py-1 px-4 border-b-4 rounded
                bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
        批次設定
    </button>
    <hr class="my-3">
    <div>
      <!-- <button class="flex items-center font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="userModal_open(-1)">
        <span class="mr-2">單一新增</span>
        <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
      </button> -->
    </div>
    <table class="w-full flex flex-row flex-no-wrap sm:bg-white rounded-lg overflow-hidden sm:shadow-lg mb-5">
      <thead class="text-white">
        <tr v-for="(user, index) in date_users"
            class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
          <th class="border-grey-light border p-2 sm:border-0" style="width: 100px;">序號</th>
          <th class="border-grey-light border p-2 sm:border-0">姓名</th>
          <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
          <th class="border-grey-light border p-2 sm:border-0">性別</th>
          <th class="border-grey-light border p-2 sm:border-0">等級</th>
          <th class="border-grey-light border p-2 sm:border-0">信箱</th>
          <th class="border-grey-light border p-2 sm:border-0">電話</th>
          <th class="border-grey-light border p-2 sm:border-0">操作</th>
        </tr>
      </thead>
      <tbody class="flex-1 sm:flex-none">
        <tr v-for="(user, index) in date_users"
          class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0 bg-white hover:bg-gray-100">
          <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
          <td class="border-grey-light border p-2">
              <a class="text-blue-500" href="###" @click="userModal_open(index)"><span v-text="user.name"></span></a>
          </td>
          <td class="border-grey-light border p-2"><span v-text="user.nick"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.gender"></span></td>
          <td class="border-grey-light border p-2 text-right"><span v-text="user.level"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.email"></span></td>
          <td class="border-grey-light border p-2"><span v-text="user.phone"></span></td>
          <td class="border-grey-light border p-1">
            <div class="sm:flex block justify-around mt-0.5">
              <button class="sm:mr-0 mr-2 rounded bg-blue-500 border-2 border-blue-700"
                      @click="userModal_open(index)">
                <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button class="sm:mr-0 mr-2  rounded bg-red-500 border-2 border-red-700"
                      @click="user_delete(index)">
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
  textarea{
    min-height: 2.5rem;
  }

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