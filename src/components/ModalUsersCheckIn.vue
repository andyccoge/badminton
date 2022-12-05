<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import UserTag from './UserTag.vue';
  import Modal from '../components/Modal.vue';
  const toast = useToast();
  const swal = inject('$swal');

  const emit = defineEmits([]);

  const modal = reactive({ 
    show: false, 
  });

  const props = defineProps({
    users: Array,
  });

  /* 報到/離場 */
  const set_user_check_in = inject('set_user_check_in');
  const check_in_all = async() => {
    const ids = [...Array(props.users.length).keys()];
    set_user_check_in(ids, 1);
    checking_users.splice(0, checking_users.length);
    toast.success('報到成功');
  }
  const check_in = async() => {
    set_user_check_in(checking_users, 1);
    checking_users.splice(0, checking_users.length);
    toast.success('報到成功');
  }
  const check_out_all = async() => {
    const ids = [...Array(props.users.length).keys()];
    set_user_check_in(ids, 0);
    checking_users.splice(0, checking_users.length);
    toast.success('離場成功');
  }
  const check_out = async() => {
    set_user_check_in(checking_users, 0);
    checking_users.splice(0, checking_users.length);
    toast.success('離場成功');
  }

  const checking_users = reactive([]);
  const add_checking_user = (user_index) => {
    const index = checking_users.indexOf(user_index);
    if(index==-1){
      checking_users.push(user_index);
    }else{
      checking_users.splice(index, 1);
    }
    console.log(checking_users)
  }

  /* 控制是否開啟視窗 */
  const toggle_modal = (status) => {
    modal.show = status;
  }

  defineExpose({
    toggle_modal, /*讓外部可控制是否開啟視窗*/
  });
</script>

<template>
  <!-- 球員報到/離場設定 -->
  <modal :show="modal.show" :click_bg_close="true" @close="modal.show=false">
    <template #header>
      <h3 class="font-bold text-xl">球員報到/離場</h3>
    </template>
    <template #body>
      <p>請點選人員：(半透明表『未報到』)</p>
      <div>
        <template v-for="user, user_index in props.users">
          <div :class="[
            'rounded-md inline-block m-0.5 relative',
            checking_users.indexOf(user_index)!=-1 ? 'border-2 border-yellow-400 shadow-md shadow-yellow-400' : '',
          ]">
            <UserTag :user_index="user_index" :user="user" 
                     @select_user="add_checking_user">
            </UserTag>
          </div>
        </template>
      </div>
    </template>
    <template #footer>
      <div class="grid grid-cols-2 gap-2 mb-2">
        <button class="font-bold py-2 px-4 border-b-4 rounded"
                :class="'bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500'"
                @click="check_in">
            報到
        </button>
        <button class="font-bold py-2 px-4 border-b-4 rounded"
                :class="'bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500'"
                @click="check_out">
            離場
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500'"
              @click="check_in_all">
          全員報到
        </button>
        <button class="font-bold py-2 px-4 border-b-4 rounded"
                :class="'bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500'"
                @click="check_out_all">
          全員離場
        </button>
      </div>
    </template>
  </modal>
</template>

<style scoped></style>