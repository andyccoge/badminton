<script setup>
  import { ref } from 'vue';
  import ModalAddhome from '../components/ModalAddhome.vue';
  import * as Icon from '@heroicons/vue/24/outline';
  import Modal from '../components/Modal.vue';
  /* 載入設定 */
  import { db_connect } from '../../db.config.js';
  let db_connect_text = db_connect.split('-');
  db_connect_text = db_connect_text.length>2 ? db_connect_text.slice(0, -1) : db_connect_text;
  db_connect_text = db_connect_text.join('-');
  const sys_name = ref(db_connect_text);

const modal_open_question = ref(false); 
</script>

<template>
  <ModalAddhome></ModalAddhome>
  <div class="h-screen flex flex-col items-center justify-center">
    <h1 class="font-bold mb-5 text-3xl sm:text-5xl text-center">
      <span class="text-sm" v-text="sys_name"></span><br>
      羽球排場系統
      <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="modal_open_question=true">
        <Icon.QuestionMarkCircleIcon class="w-5 h-5"></Icon.QuestionMarkCircleIcon>
      </button>
    </h1>
    <div class="w-full grid sm:grid-cols-2 grid-cols-1 mb-20 sm:px-4 px-0">
      <div class="m-4 flex justify-center">
        <a class="group" href="/pages/court_manage.html">
          <button class="p-10 aspect-square font-bold border-4 rounded
                        flex flex-col items-center justify-center
                      bg-purple-500 hover:bg-purple-400 text-white border-purple-700 hover:border-purple-500">
              <svg class="w-8 h-8 mb-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              安排比賽<br>
              (最新打球日)
          </button>
        </a>
      </div>
      <div class="m-4 flex justify-center">
        <a class="group" href="/pages/setting_date.html">
          <button class="p-10 aspect-square font-bold border-4 rounded
                        flex flex-col items-center justify-center
                      bg-purple-500 hover:bg-purple-400 text-white border-purple-700 hover:border-purple-500">
            <svg class="w-8 h-8 mb-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            後台管理<br>
            <span class="invisible">(設定打球日)</span>
          </button>
        </a>
      </div>
    </div>
  </div>

  <!-- 操作說明 -->
  <modal :show="modal_open_question" :click_bg_close="true" @close="modal_open_question=false">
    <template #header>
      <h3 class="font-bold text-xl flex items-center">
        操作說明
      </h3>
    </template>
    <template #body>
      <div class="mb-2">
        可將此網頁「加入桌面」，可省去瀏覽器外框，更方便使用~<br>
        (使用chrome瀏覽器開啟此網頁，會有跳出視窗詢問是否加入桌面，若無詢問也可收動安裝，點擊瀏覽器右上方「點點點」，選擇「安裝應用程式」即可)
      </div>
      <div class="mb-2">
        先簡單說明一下基本流程：
        <ol>
          <li>後台管理>打球日管理 新增打球日。</li>
          <li>打球日新增完成後點ID的超連結或紫色小齒輪進入設定詳細內容。</li>
          <li>設定場地，可新增多個比賽場及預備場，比賽場可輸入名稱，例如：場地A。</li>
          <li>
            設定人員，有三種設法：
            <ul>
              <li>單一設定：選擇已往建立過的人員。</li>
              <li>單一新增：一個一個新增，可輸入性別、等級等資料。</li>
              <li>批次設定：以英文逗號(,)分隔姓名，系統會去比對過去名單，存在則套用，不存在則新增。</li>
            </ul>
          </li>
        </ol>
      </div>
      <div class="mb-2">
        以上都完成後就可點時間/地點 區塊，操作的第二顆按鈕(四個小正方形)，或回首頁點安排比賽(抓最新的打球日)開始進行場地的人員安排~
      </div>
    </template>
    <template #footer>
      <div></div>
    </template>
  </modal>
</template>

<style scoped>
  ol{
    list-style: auto;
  }
  ul{
    list-style: disc;
  }
  ol,ul{
    padding: revert;
  }
</style>