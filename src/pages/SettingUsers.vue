<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  // 資料庫初始化-------------------------------------------------------------------------
  const refFirebase = ref(null);
  const sign_in_success = async() => {
    await get_users();
  } 

  // 新增/編輯人員-------------------------------------------------------------------------
  const refModalUserEditor = ref(null);
  const userModal_open = (user_index=-1) => {
    let target_user = user_index!=-1 ? Object.assign({}, users[user_index]) : null;
    refModalUserEditor.value.set_user(user_index, target_user);
  }
  const change_user_data = (user_index, user_data) => {
    if(refModalUserEditor.value.userModal.index==-1){
      users.unshift(user_data)
    }else{
      let user_keys = Object.keys(user_data);
      user_keys.forEach(key => { users[user_index][key] = user_data[key] });
    }
  }

  // 人員列表-------------------------------------------------------------------------
  let users = reactive([]);
  let users_input_data = ref('');
  const add_users = async() => {
    let new_data = [];
    let data = users_input_data.value;
    data = data.split(',');
    data = data.filter((item)=>{ return item.trim() });
    if(data.length==0){ toast.warning('請輸入員名稱');return; }

    for (let i = 0; i < data.length; i++) {
      const d = data[i].trim();
      if(d){ new_data.push({name:d}); }
    }
    // console.log(new_data);
    let ids = await refFirebase.value.db_set_data('users', new_data);
    await get_users();
    toast.success('新增成功');
    users_input_data.value = '';
  }
  const get_users = async() => {
    users.splice(0, users.length);
    let user_data = await refFirebase.value.db_get_data('users');
    user_data.forEach(data => {
      users.push(data);
    });
  }
  const user_delete = (user_index) => {
    if (user_index < 0 && user_index > users.length) { return; }
    swal({
      title: '確定刪除此人？',
      text: "刪除後此人過去的比賽紀錄可能顯示會有問題",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
      cancelButtonText: '取消',
      cancelButtonColor: '#d33',
    }).then(async(result) => {
      if (result.isConfirmed) {
        await refFirebase.value.db_delete_data('users', users[user_index].id);
        users.splice(user_index, 1);
      }
    });
  }
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>
  <ModalFirebase @sign_in_success="sign_in_success"></ModalFirebase>
  <ModalUserEditor @change_user_data="change_user_data" ref="refModalUserEditor"></ModalUserEditor>
  <NavSetting></NavSetting>

  <div class="p-2">
    <h1 class="text-xl font-bold">人員列表</h1>
    <h3 class="">批次新增人員(請輸入人名並以英文逗點分隔，人名間的空白及換行不會影響程式運作)</h3>
    <textarea class="w-full" rows="2" v-model="users_input_data" placeholder="陳XX, 王OO"></textarea>
    <p class="text-red-600">※此處新增不會檢查資料庫是否重複，因為姓名可重複</p>
    <button @click="add_users"
            class="w-full font-bold py-1 px-4 border-b-4 rounded
                bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500">
        批次新增
    </button>
    <hr class="my-3">
    <div>
      <button class="flex items-center font-bold py-1 px-4 ml-2 border-b-4 rounded text-white
                     bg-yellow-500 hover:bg-yellow-400 border-yellow-700 hover:border-yellow-500" 
              @click="userModal_open(-1)">
        <span class="mr-2">單一新增</span>
        <svg class="h-5 w-5 text-white"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
      </button>
    </div>
    <div class="table_container">
      <table class="w-full flex flex-row flex-no-wrap sm:bg-white sm:shadow-lg">
        <thead class="text-white">
          <tr v-for="(user, index) in users"
              class="bg-teal-400 flex flex-col flex-no wrap sm:table-row rounded-l-lg sm:rounded-none mb-2 sm:mb-0">
            <th class="border-grey-light border p-2 sm:border-0 text-right">序號</th>
            <th class="border-grey-light border p-2 sm:border-0">姓名</th>
            <th class="border-grey-light border p-2 sm:border-0">暱稱</th>
            <th class="border-grey-light border p-2 sm:border-0">性別</th>
            <th class="border-grey-light border p-2 sm:border-0 text-right">等級</th>
            <th class="border-grey-light border p-2 sm:border-0">信箱</th>
            <th class="border-grey-light border p-2 sm:border-0">電話</th>
            <th class="border-grey-light border p-2 sm:border-0">操作</th>
          </tr>
        </thead>
        <tbody class="flex-1 sm:flex-none">
          <tr v-for="(user, index) in users" class="flex flex-col flex-no wrap sm:table-row mb-2 sm:mb-0"
              :class="[user.gender=='女' ?'bg-red-100 hover:bg-red-200' : 'bg-blue-100 hover:bg-blue-200']">
            <td class="border-grey-light border p-2 text-right"><span v-text="index+1"></span></td>
            <td class="border-grey-light border p-2">
              <div class="flex items-center">
                <a class="text-blue-500" href="###" @click="userModal_open(index)"><span v-text="user.name"></span></a>
                <button @click="functions.copy_text(user.name)">
                  <svg class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </button>
              </div>
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
  </div>
</template>

<style scoped>
  @import url("../assets/table.css");
  
  textarea{
    min-height: 2.5rem;
  }
</style>