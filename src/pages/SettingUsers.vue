<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import ModalFirebase from '../components/ModalFirebase.vue';
  import ModalUserEditor from '../components/ModalUserEditor.vue';
  import NavSetting from '../components/NavSetting.vue';
  import UserList from '../components/UserList.vue';
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
                bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500">
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
    <UserList :users="users" @userModal_open="userModal_open" @user_delete="user_delete"></UserList>
  </div>
</template>

<style scoped>
  textarea{
    min-height: 2.5rem;
  }
</style>