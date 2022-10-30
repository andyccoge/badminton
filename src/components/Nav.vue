<!-- This example requires Tailwind CSS v2.0+ -->
<script setup>
  import { ref, inject } from 'vue';
  import { db_sign_out } from '../firebase.js';
  import Modal from '../components/Modal.vue';
  import * as Icon from '@heroicons/vue/24/outline';
  import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  const show_notify = false;
  const show_head_icon = false;
  const user = {
    name: '',
    email: '',
    imageUrl: '/src/assets/img/user.png',
  };
  const navigation = [
    // { name: 'Dashboard', href: '#', current: true },
    // { name: 'Team', href: '#', current: false },
    // { name: 'Projects', href: '#', current: false },
    // { name: 'Calendar', href: '#', current: false },
    // { name: 'Reports', href: '#', current: false },
  ];
  const userNavigation = [
    // { name: 'Your Profile', href: '#' },
    // { name: 'Settings', href: '#' },
    // { name: 'Sign out', href: '#' },
  ];

  let modal_open_contest_record = inject('modal_open_contest_record');
  const modal_open_question = ref(false); 
</script>

<template>
  <div class="min-h-full">
    <Disclosure as="nav" class="bg-yellow-500" v-slot="{ open }">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-8 items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a href="/">
                <img class="h-6 w-6" src="/src/assets/img/favicon.ico" alt="羽球排場系統" />
              </a>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a v-for="item in navigation" :key="item.name" :href="item.href" :class="[item.current ? 'bg-yellow-600 text-white' : 'text-yellow-900 hover:bg-yellow-700 hover:text-white', 'px-3 py-1 rounded-md text-sm font-medium']" :aria-current="item.current ? 'page' : undefined">{{ item.name }}</a>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="modal_open_question=true">
              <Icon.QuestionMarkCircleIcon class="w-5 h-5"></Icon.QuestionMarkCircleIcon>
            </button>
            <button class="rounded-2xl p-0.5 aspect-square border-2 mr-2 bg-yellow-300 border-yellow-600" @click="modal_open_contest_record=true">
              <Icon.TableCellsIcon class="w-5 h-5"></Icon.TableCellsIcon>
            </button>
            <button class="rounded-2xl p-0.5 aspect-square border-2 bg-yellow-300 border-yellow-600" @click="db_sign_out()">
              <Icon.ArrowRightOnRectangleIcon class="w-5 h-5"></Icon.ArrowRightOnRectangleIcon>
            </button>
            <div class="hidden md:block" v-if="userNavigation.length>0 || show_notify">
              <div class="flex items-center">
                <button type="button" v-if="show_notify"
                        class="rounded-full ml-2 p-1 focus:outline-none focus:ring-2
                            bg-yellow-600 text-yellow-400 hover:text-white focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
                  <span class="sr-only">View notifications</span>
                  <Icon.BellIcon class="h-4 w-4" aria-hidden="true" />
                </button>
                <!-- Profile dropdown -->
                <Menu as="div" class="relative ml-3" v-if="userNavigation.length>0 || show_head_icon">
                  <div>
                    <MenuButton class="flex max-w-xs items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
                                      bg-yellow-600 text-sm focus:ring-white focus:ring-offset-yellow-600">
                      <span class="sr-only">Open user menu</span>
                      <img class="h-6 w-6 rounded-full" :src="user.imageUrl" :alt="user.name" v-if="show_head_icon"/>
                    </MenuButton>
                  </div>
                  <transition v-if="userNavigation.length>0"
                              enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                        <a :href="item.href" :class="[active ? 'bg-yellow-100' : '', 'block px-4 py-2 text-sm text-yellow-700']">{{ item.name }}</a>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
            <div class="ml-2 flex md:hidden" v-if="navigation.length>0 || show_head_icon">
              <!-- Mobile menu button -->
              <DisclosureButton class="inline-flex items-center justify-center rounded-md bg-yellow-600 p-1 text-yellow-400 hover:bg-yellow-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
                <span class="sr-only">Open main menu</span>
                <Icon.Bars3Icon v-if="!open" class="block h-4 w-4" aria-hidden="true" />
                <Icon.XMarkIcon v-else class="block h-4 w-4" aria-hidden="true" />
              </DisclosureButton>
            </div>
          </div>
        </div>
      </div>

      <DisclosurePanel class="md:hidden">
        <div class="space-y-1 px-2 pt-2 pb-3 sm:px-3" v-if="navigation.length>0">
          <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[item.current ? 'bg-yellow-700 text-white' : 'text-yellow-900 hover:bg-yellow-700 hover:text-white', 'block px-3 py-1 rounded-md text-base font-medium']" :aria-current="item.current ? 'page' : undefined">{{ item.name }}</DisclosureButton>
        </div>
        <div class="border-t border-yellow-700 pt-4 pb-3" v-if="show_head_icon">
          <div class="flex items-center px-5">
            <div class="flex-shrink-0">
              <img class="h-10 w-10 rounded-full" :src="user.imageUrl" alt="" />
            </div>
            <div class="ml-3">
              <div class="text-base font-medium leading-none text-white">{{ user.name }}</div>
              <div class="text-sm font-medium leading-none text-yellow-900">{{ user.email }}</div>
            </div>
            <button type="button" v-if="show_notify"
                    class="ml-auto flex-shrink-0 rounded-full bg-yellow-600 p-1 text-yellow-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-600">
              <span class="sr-only">View notifications</span>
              <Icon.BellIcon class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-3 space-y-1 px-2" v-if="userNavigation.length>0">
            <DisclosureButton v-for="item in userNavigation" :key="item.name" as="a" :href="item.href" class="block rounded-md px-3 py-1 text-base font-medium text-yellow-900 hover:bg-yellow-700 hover:text-white">{{ item.name }}</DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
  <div class="nav_blank"></div>

  <!-- 操作說明 -->
  <modal :show="modal_open_question" :click_bg_close="true" @close="modal_open_question=false">
    <template #header>
      <h3 class="font-bold text-xl flex items-center">
        操作說明
      </h3>
    </template>
    <template #body>
      <ul style="list-style: cjk-ideographic;">
        <li class="mb-2">
          場地：<br>
          <ul>
            <li>
              比賽場(綠色)：<br>
              有兩排控制按鈕,上方由左到右各別是「編輯場地名稱」、「刪除場地」(該球員會被設為閒置)、「換下一場」(會從預備場拉人上來)；下方則為「比賽時間」、「開始計時」。<br>
              目前做成場地需先「開始計時」才能「換下一場」，而換下一場後會自動開始計時。
            </li>
            <li>
              預備場(黃色)：<br>
              可設定多組人等候上場，預備人員可跟其他預備場及比賽場人員重複，但換場時會判斷人員是否都閒置中，是的話才安排上場，因此所以可多多利用，由系統自動調度人員。<br>
              另外，預備場上的人員如果有3人以上跟比賽紀錄的人員組合重複，場地右上角會有發光藍點提示。
            </li>
            <li>
              人員安排方法：<br>
              點擊場地兩側白色區塊，系統會將選擇的位置標記紅色(進入「排人模式」)，並打開人員面板，此時再選擇面板中的人員即可安排上場。<br>
              如要替換人員，操作方式同上。<br>
              如要移除已排定的人員，點擊該人員後的垃圾桶即可。<br>
              安排「比賽場」人員時會有防呆，不允許同一人同時在多個比賽場，但預備場則無此限制。
            </li>
          </ul>
        </li>
        <li class="mb-2">
          人員面板：<br>
          點擊人員面板即可開啟/關閉它，裡面包含該打球日所有的球員，並會依在場地上的狀態有不同顯示，如果有上比賽場會變為透明，如果有上預備場會發黃光。<br>
          人員面板上有一排控制按鈕，由左到右是「切換顯示內容多寡」、「重新載入人員」、「切換群組人員模式」、「添加人員」，各別功能說明如下：
          <ul>
            <li>
              顯示內容：<br>
              預設為多，會顯示「排序設定」、「各人員完賽數」、「等候提示場數輸入區」，其中排序分為三種：
              <ul>
                <li>一般：依未準備、準備中、比賽中分批先後顯示，各批再依完賽數由小到大排序。</li>
                <li>自訂：可行拖拉排序，但有新增、刪除人員時，會重置。另外在此排序下若想選擇人員上場，請「關閉」拖拉功能(開關在下拉選右側)，否則可能無法操作。</li>
                <li>群組；有組別的排在前面。</li>
              </ul>
              等候提示場數輸入區可輸入數字，當人員等候場數大於設定的數字時，人員右上方將有發光紅點標記。
            </li>
            <li>
              群組人員模式：<br>
              此模式下可對人員進行標記，主要用於註記有一起上場需求的人，使用方式如下：
              <ul>
                <li>先入群組人員模式(人員面板會變為黑色)，然後點擊全部想群組的人，再點建成群組就會標上組別。</li>
                <li>如果希望刪除群組，則一次只選一人建成群組，慢慢就會被移除。</li>
                <li>關閉面板或再點一次「切換群組人員模式」就會離開群駔人員模式。</li>
              </ul>             
            </li>
            <li>添加人員會比對姓名是否重複(同打球日詳細內容設定人員的單一新增)。</li>
          </ul>
          各人員有小眼睛，點擊可打開「人員詳細資料」，其中可查看詳細內容外，也可設定是否繳費、資料編輯等。另外有兩種方式也可開啟「人員詳細資料」：
          <ul>
            <li>在非「排人模式」、非「群組人員模式」下點擊人員。</li>
            <li>長按場地上人員姓名，下方會顯示黑色操作選單，點擊小眼睛即可。</li>
          </ul>
        </li>
        <li class="mb-2">
          比賽紀錄：<br>
          當比賽場換下一場時，會產生比賽紀錄，可於上方選單右側「表格」按鈕點擊看到，點擊比數超連結可對其進行修改。
        </li>
      </ul>
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
  nav{
      width: 100%;
      top: 0;
      position: fixed;
      z-index: 15;
  }
  .nav_blank{
    padding-top: var(--nav_h);
  }
</style>