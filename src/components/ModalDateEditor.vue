<script setup>
  import { ref, reactive, inject, watch } from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  const swal = inject('$swal');

  const refFirebase = ref(null);

  const props = defineProps({
    dates: Array,
  })

  let dataModal_date = ref('2022-10-10T00:00');
  const copy_date_id = ref('');
  const data_empty = {id:null, date:'', location:''};
  let dataModal = reactive({ 
    show:false, index:-1, 
    data: JSON.parse(JSON.stringify(data_empty)),
  });
  watch(copy_date_id, (nV, oV) => {
    // console.log(nV, oV);
    if(nV && nV!=oV){ set_location(); }
  });

  const emit = defineEmits(['change_date_data']);

  let dataModal_keys = Object.keys(data_empty);
  const dataModal_input_copy_date_id = ref(null);
  const dataModal_input_date = ref(null);

  /* 設定跳出視窗內的資料 */
  const set_data = (index, target) => {
    copy_date_id.value ='';
    dataModal.show = true;
    dataModal.index = index;
    dataModal_keys.forEach(key => { 
      dataModal.data[key] = data_empty[key];
      if(target){
        if(typeof(target[key])!='undefined'){ dataModal.data[key] = target[key]; }
      }
    });
    
    /* 特殊處理日期資料 */
    dataModal_date.value = functions.stamp_to_time(dataModal.data.date, 'Y-m-dTH:i');
    
    setTimeout(()=>{ 
      if(index==-1){ /* 新增 */
        dataModal_input_copy_date_id.value.focus();
      }else{ /* 編輯 */
        dataModal_input_date.value.focus();
      }
    }, 100);
  }

  const set_location = () => {
    const date_id = copy_date_id.value;
    if(!date_id){ return; }
    if(!props.dates){ return; }
    for (let x = 0; x < props.dates.length; x++) {
      const court = props.dates[x];
      if(court.id==date_id){
        dataModal.data.location = court.location;
      }
    }
  }

  const data_save = async() => {
    let target = {};
    /* 特殊處理日期資料 */
    let date_obj = new Date(dataModal_date.value.replace('T', ' '));
    dataModal.data.date = date_obj.getTime();
    
    if(!dataModal_date.value){ toast.warning("請選擇時間");return; }
    if(!dataModal.data.location){ toast.warning("請輸入地點");return; }
    dataModal_keys.forEach(key => { target[key] = dataModal.data[key] });

    refFirebase.value.set_body_block_show_long(true);
    if(dataModal.index==-1){
      target = await refFirebase.value.db_add_data('game_date', target, [
        ['location', '==', target.location],
        ['date', '==', target.date]
      ]);
      if(copy_date_id.value){
        await refFirebase.value.copy_date(target['id'], copy_date_id.value);
      }
    }else{
      let result = await refFirebase.value.db_update_data('game_date', target.id, target);
      if(!result){ 
        refFirebase.value.set_body_block_show_long(false);
        return;
      }
    }
    refFirebase.value.set_body_block_show_long(false);

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
      <div class="mb-2" v-show="dataModal.index==-1">
        複製打球日設定：<span class="text-red-500">(系統將複製對應打球日的場地及打球人員資料)</span>
        <input type="text" class="form-input px-1 py-1 rounded w-full" ref="dataModal_input_copy_date_id"
               placeholder="請輸入打球日ID"
               v-model="copy_date_id" @keypress.enter="data_save"/>
      </div>
      <div class="mb-2">
        日期時間：<input type="datetime-local" class="form-input px-1 py-1 rounded w-full" ref="dataModal_input_date"
                    v-model="dataModal_date" @keypress.enter="data_save"/>
      </div>
      <div class="mb-2">
        地點：<input type="text" class="form-input px-1 py-1 rounded w-full" ref="dataModal_input_location"
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