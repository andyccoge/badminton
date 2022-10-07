<script setup>
  import { ref, reactive, inject } from 'vue';
  import * as firebase from '../firebase.js';
  import { useToast } from "vue-toastification";
  import Modal from '../components/Modal.vue';
  import BodyBlock from '../components/BodyBlock.vue';
  const toast = useToast();
  const swal = inject('$swal');
  let body_block_show = ref(false);

  let userModal  = reactive({ 
    show:false, index:-1, 
    user:{id:0, name:'', nick:'', gender:"", level:0, phone:'', email:'', played:0, wait:0, status:0}
  });
  const emit = defineEmits(['change_user_data']);

  /* level：等級、played：已比場數、wait：等候場數、status:狀態0.閒置 1.場上 */
  const user_empty = {id:null, name:'', nick:'', gender:"", level:0, phone:'', email:''};
  let userModal_keys = Object.keys(user_empty);
  const userModal_user_name = ref(null);
  const userModal_user_level = ref(null);

  /* 設定跳出視窗內的人員資料 */
  const set_user = (user_index, target_user) => {
    userModal.show = true;
    userModal.index = user_index;
    if(target_user){
      userModal.user = target_user;
    }else{
      userModal_keys.forEach(key => { userModal.user[key] = user_empty[key] });
    }
    setTimeout(()=>{ userModal_user_name.value.focus() }, 100);
  }

  const user_save = async() => {
    let target_user = {};
    if(!userModal.user.name){ toast.warning("請輸入姓名");return; }
    userModal_keys.forEach(key => { target_user[key] = userModal.user[key] });

    body_block_show.value = true;
    if(userModal.index==-1){
      let repeat_user = await firebase.get_db_data('users', [['name', '==', target_user.name]]);
      if(repeat_user.length>0){
        await swal({
          title: '發現重複資料，確定新增？',
          text: "",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '確定',
          confirmButtonColor: '#3085d6',
          cancelButtonText: '取消',
          cancelButtonColor: '#d33',
        }).then(async(result) => {
          if (result.isConfirmed) {
            let target_user_id = await firebase.add_data('users', target_user);
            target_user.id = target_user_id;
          }else{
            target_user = null;
          }
        });
      }else{
        let target_user_id = await firebase.add_data('users', target_user);
        target_user.id = target_user_id;
      }
    }else{
      await firebase.update_data('users', target_user.id, target_user);
    }
    body_block_show.value = false;

    if(target_user){
      toast.success("資料已儲存");
      if(userModal.index==-1){
        userModal_keys.forEach(key => { userModal.user[key] = user_empty[key] });
      }
      emit('change_user_data', userModal.index, target_user);
    }
  }

  defineExpose({
    userModal,
    set_user,
  })
</script>

<template>
  <BodyBlock :show="body_block_show"></BodyBlock>

  <!-- 新增/編輯人員 -->
  <modal :show="userModal.show" @close="userModal.show = false;">
    <template #header>
      <h3 class="font-bold text-xl" v-if="userModal.index==-1">新增人員</h3>
      <h3 class="font-bold text-xl" v-if="userModal.index!=-1">編輯人員</h3>
    </template>
    <template #body>
      <div class="mb-2">
        姓名：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_name"
                    v-model="userModal.user.name" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        綽號：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_nick"
                    v-model="userModal.user.nick" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        性別：
        <input type="radio" id="gender_1" ref="userModal_user_gender_男" value="男" class="mr-1"
                    v-model="userModal.user.gender" @click="userModal_user_level.focus()"/>
        <label for="gender_1" class="mr-4">男</label>
        <input type="radio" id="gender_0" ref="userModal_user_gender_女" value="女" class="mr-1"
                    v-model="userModal.user.gender" @click="userModal_user_level.focus()"/>
        <label for="gender_0">女</label>
      </div>
      <div class="mb-2">
        等級：<input type="number" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_level"  min="0" step="1"
                    v-model="userModal.user.level" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        電話：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_phone"
                    v-model="userModal.user.phone" @keypress.enter="user_save"/>
      </div>
      <div class="mb-2">
        信箱：<input type="email" class="form-input px-1 py-1 rounded w-full" ref="userModal_user_email"
                    v-model="userModal.user.email" @keypress.enter="user_save"/>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500'"
              @click="user_save">
        確認儲存
      </button>
    </template>
  </modal>
</template>

<style scoped>
</style>