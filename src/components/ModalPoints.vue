<script setup>
  import { ref, reactive, inject} from 'vue';
  import { useToast } from "vue-toastification";
  import Firebase from '../components/Firebase.vue';
  import Modal from '../components/Modal.vue';
  import * as functions from '../functions.js';
  const toast = useToast();
  // const swal = inject('$swal');

  const refFirebase = ref(null);

  const emit = defineEmits(['court_start', 'update_court_points']);
  const users = inject('users') ? inject('users') : [];

  const empty_point_modal_data = {
    show: false, finish_index: -1, repeat_index: -1, game_records_id:null, game_points:[0,0], users:[[0,0],[0,0]],
  }
  let pointModal = reactive(JSON.parse(JSON.stringify(empty_point_modal_data)));
  const model_point_input = ref(null);

  const set_modal_data = (finish_index, repeat_index, court, game_records_id=null) => {
    pointModal.show = true;
    pointModal.finish_index = finish_index;
    pointModal.repeat_index = repeat_index;
    pointModal.game_points =JSON.parse(JSON.stringify(court.game_points));
    pointModal.users = JSON.parse(JSON.stringify(court.users));
    pointModal.game_records_id = game_records_id;
    setTimeout(()=>{ model_point_input.value.focus() }, 100);
  }
  const save_points = async() => {
    emit('update_court_points', pointModal.finish_index, pointModal.repeat_index, pointModal.game_points.slice());
    if(pointModal.game_records_id){
      await refFirebase.value.db_update_data('game_records', pointModal.game_records_id, {'game_points': pointModal.game_points});
      toast.success('已儲存比數');
    }
    pointModal.show = false;
  }

  defineExpose({
    set_modal_data,
  })
</script>

<template>
  <Firebase ref="refFirebase"></Firebase>

  <!-- 輸入比數 -->
  <modal :show="pointModal.show" :click_bg_close="true" 
         @close="pointModal.show = false; emit('court_start', pointModal.finish_index);">
    <template #header>
      <h3 class="font-bold text-xl">輸入比數</h3>
    </template>
    <template #body>
      <div class="flex items-center justify-around">
        <div class="text-center">
          <span v-text="functions.get_user_name(users, pointModal.users[0][0])"></span>
          <span v-if="pointModal.users[0][0]!=0 && pointModal.users[0][1]!=0">、</span>
          <span v-text="functions.get_user_name(users, pointModal.users[0][1])"></span>
          <input type="number" step="1" min="0" class="form-input px-1 py-1 rounded w-full"
                 @keyup.enter="save_points"
                 v-model="pointModal.game_points[0]" ref="model_point_input"/>
        </div>
        <div class="p-1"><br>：</div>
        <div class="text-center">
          <span v-text="functions.get_user_name(users, pointModal.users[1][0])"></span>
          <span v-if="pointModal.users[1][0]!=0 && pointModal.users[1][1]!=0">、</span>
          <span v-text="functions.get_user_name(users, pointModal.users[1][1])"></span>
          <input type="number" step="1" min="0" class="form-input px-1 py-1 rounded w-full"
                 @keyup.enter="save_points"
                 v-model="pointModal.game_points[1]"/>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="w-full font-bold py-2 px-4 border-b-4 rounded"
              :class="'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700 hover:border-yellow-500'"
              @click="save_points">
        完成比賽
      </button>
    </template>
  </modal>
</template>

<style scoped></style>