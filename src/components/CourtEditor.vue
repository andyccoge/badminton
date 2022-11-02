<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  const refFirebase = ref(null);

  const game_date_id = inject('game_date_id');

  const emit = defineEmits(['change_court_data']);
  const court_delete = inject('court_delete') ? inject('court_delete') : null;
  const court_delete_editor = async() => {
    if(court_delete){
      const result = await court_delete(courtModal.index);
      if(result.isConfirmed){
        courtModal.show = false;
        reset_courtModal();
      }
    }
  }

  const court_name = ref(null);
  let courts = inject('courts');
  const courtModal_empty = {name: '', type:0}
  let courtModal_empty_keys = Object.keys(courtModal_empty);
  let courtModal = reactive({
    show: false, index: -1, ...courtModal_empty
  });
  
  const set_court_data = (court_index) => {
    courtModal.show = true;
    courtModal.index = court_index;
    courtModal.name = courts[court_index].name;
    courtModal.type = courts[court_index].type;
    setTimeout(()=>{ court_name.value.focus() }, 100);
  }
  const courtModal_add = async(court_type) => {
    reset_courtModal(court_type); 
    if(court_type==0){ /* 預備場地 */
      courtModal.name = '預備';
      await add_court();
    }else{ /* 正式場地 */
      courtModal.show = true;
      setTimeout(()=>{ court_name.value.focus() }, 100);
    }
  }

  const add_court = async() => {
    let target = JSON.parse(JSON.stringify(courtModal));
    if(!courtModal.name){ toast.warning("請輸入場地名稱");return; }
  
    if(courtModal.index==-1){
      target.game_date_id = game_date_id.value;
      target = await refFirebase.value.db_add_data('game_date_courts', target);
    }else{
      await refFirebase.value.db_update_data('game_date_courts', courts[courtModal.index].id, target);
    }
    courtModal.show = false;

    if(target){
      toast.success("資料已儲存");
      emit('change_court_data', courtModal.index, target);
    }
    reset_courtModal();
  }
  const reset_courtModal = (court_type=0) => {
    courtModal.index = -1;
    courtModal.name = "";
    courtModal.type = court_type;
  }

  defineExpose({
    set_court_data,
    courtModal_add,
  })
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>

  <!-- 新增/編輯場地 -->
  <modal :show="courtModal.show" :click_bg_close="true" 
         @close="courtModal.show = false">
    <template #header>
      <h3 class="font-bold text-xl" v-if="courtModal.index==-1">新增場地</h3>
      <h3 class="font-bold text-xl" v-if="courtModal.index!=-1">編輯場地</h3>
    </template>
    <template #body>
      <p>請輸入場定名稱：</p>
      <input type="text" class="form-input px-1 py-1 rounded w-full" 
              ref="court_name" v-model="courtModal.name" @keypress.enter="add_court"/>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="[courtModal.type==1 ? 'bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500' :
                                            'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'
                      ]"
              @click="add_court">
        確認儲存
      </button>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded mt-2
                     bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500"
              v-if="courtModal.index!=-1 && court_delete"
              @click="court_delete_editor">
        刪除
      </button>
    </template>
  </modal>
</template>

<style scoped></style>