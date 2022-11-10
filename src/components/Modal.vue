<script setup>
  import * as Icon from '@heroicons/vue/24/outline';

  const props = defineProps({
    show: Boolean,
    click_bg_close: Boolean,
    overflow: String,
  })
  console.log(props.overflow)
  let body_style = props.overflow ? {'overflow':props.overflow} : {'overflow-y':'scroll'};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-mask" @keyup.esc="$emit('close')">
        <div class="modal-wrapper" @click.self="props.click_bg_close ? $emit('close') : ''">
          <div class="modal-container relative">
            <div class="modal-header">
              <button class="modal-default-button absolute right-0 top-0 p-1"
                      @click="$emit('close')">
                <Icon.XCircleIcon class="h-6 w-6 text-black"></Icon.XCircleIcon>
              </button>
              <slot name="header">default header</slot>
            </div>
            <div class="modal-body" :style="body_style">
              <slot name="body">default body</slot>
            </div>
            <div class="modal-footer">
              <slot name="footer">
                  default footer
                  <button class="modal-default-button"  @click="$emit('close')">OK</button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
  .modal-mask {
    position: fixed;
    z-index: 500;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
  }
  
  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }
  
  .modal-container {
    width: fit-content;
    min-width: 50%;
    max-width: 100%;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
  }
  
  .modal-header h3 {
    margin-top: 0;
  }
  
  .modal-body {
    margin: 20px 0;
    max-height: 80vh;
  }
  
  .modal-default-button {
    float: right;
  }
  
  /*
    * The following styles are auto-applied to elements with
    * transition="modal" when their visibility is toggled
    * by Vue.js.
    *
    * You can easily play with the modal transition by editing
    * these styles.
  */
  .modal-enter-from {
    opacity: 0;
  }
  
  .modal-leave-to {
    opacity: 0;
  }
  
  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>