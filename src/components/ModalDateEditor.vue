<script setup>
  import { ref, reactive, inject } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  const refFirebase = ref(null);

  let dataModal_date = ref('2022-10-10T00:00');
  let dataModal  = reactive({ 
    show:false, index:-1, 
    data:{id:null, date:'', location:''}
  });
  const emit = defineEmits(['change_date_data']);

  const data_empty = {id:null, date:'', location:''};
  let dataModal_keys = Object.keys(data_empty);
  const dataModal_input_first = ref(null);

  /* 設定跳出視窗內的資料 */
  const set_data = (index, target) => {
    dataModal.show = true;
    dataModal.index = index;
    if(target){
      dataModal.data = target;
    }else{
      dataModal_keys.forEach(key => { dataModal.data[key] = data_empty[key] });
    }
    
    /* 特殊處理日期資料 */
    dataModal_date.value = functions.stamp_to_time(dataModal.data.date, 'Y-m-dTH:i');
    
    setTimeout(()=>{ dataModal_input_first.value.focus() }, 100);
  }

  const data_save = async() => {
    let target = {};
    /* 特殊處理日期資料 */
    let date_obj = new Date(dataModal_date.value.replace('T', ' '));
    dataModal.data.date = date_obj.getTime();
    
    if(!dataModal_date.value){ toast.warning("請選擇時間");return; }
    if(!dataModal.data.location){ toast.warning("請輸入地點");return; }
    dataModal_keys.forEach(key => { target[key] = dataModal.data[key] });

    if(dataModal.index==-1){
      target = await refFirebase.value.db_add_data('game_date', target, [
        ['location', '==', target.location],
        ['date', '==', target.date]
      ]);
    }else{
      let result = await refFirebase.value.db_update_data('game_date', target.id, target);
      if(!result){ return; }
    }

    if(target){
      toast.success("資料已儲存");
      if(dataModal.index==-1){
        dataModal_keys.forEach(key => { dataModal.data[key] = data_empty[key] });
        /* 額外處理日期資料 */
        dataModal_date.value = '';
      }
      emit('change_data', dataModal.index, target);
      dataModal.show = false;
    }
  }

  defineExpose({
    dataModal,
    set_data,
  })
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>

  <!-- 新增/編輯打球日 -->
  <modal :show="dataModal.show" @close="dataModal.show = false;">
    <template #header>
      <h3 class="font-bold text-xl" v-if="dataModal.index==-1">新增打球日</h3>
      <h3 class="font-bold text-xl" v-if="dataModal.index!=-1">編輯打球日</h3>
    </template>
    <template #body>
      <div class="mb-2">
        日期時間：<input type="datetime-local" class="form-input px-1 py-1 rounded w-full" ref="dataModal_input_first"
                    v-model="dataModal_date" @keypress.enter="data_save"/>
      </div>
      <div class="mb-2">
        地點：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="dataModal_user_nick"
                    v-model="dataModal.data.location" @keypress.enter="data_save"/>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-red-500 hover:bg-red-400 text-white border-red-700 hover:border-red-500'"
              @click="data_save">
        確認儲存
      </button>
    </template>
  </modal>
</template>

<style scoped>
</style>