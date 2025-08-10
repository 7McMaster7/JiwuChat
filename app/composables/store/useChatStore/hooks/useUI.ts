/**
 * UI 状态与滚动、面板控制
 * @returns UI
 */
export function createUIModule() {
  const showExtension = ref(false);
  const pageTransition = ref<{ name?: string, mode?: "in-out" | "out-in", duration?: number }>({ name: "", duration: 200 });

  const showVideoDialog = ref(false);
  const notDialogShow = computed({
    get: () => !showVideoDialog.value && !showExtension.value && !showVideoDialog.value && !useImageViewer.state.visible,
    set: (val: boolean) => {
      if (!val) {
        showVideoDialog.value = false;
        showExtension.value = false;
        useImageViewer.close();
      }
    },
  });

  const shouldAutoScroll = ref(false);
  const isScrollBottom = ref(false);

  const scrollBottom = (animate = true) => {
    mitter.emit(MittEventType.MSG_LIST_SCROLL, { type: "scrollBottom", payload: { animate } });
  };
  const scrollReplyMsg = (msgId: number, gapCount: number = 0, isAnimated: boolean = true) => {
    mitter.emit(MittEventType.MSG_LIST_SCROLL, { type: "scrollReplyMsg", payload: { msgId, gapCount, isAnimated } });
  };
  const saveScrollTop = () => {
    mitter.emit(MittEventType.MSG_LIST_SCROLL, { type: "saveScrollTop", payload: {} });
  };
  const scrollTop = (size: number) => {
    mitter.emit(MittEventType.MSG_LIST_SCROLL, { type: "scrollTop", payload: { size } });
  };

  function resetUI() {
    showExtension.value = false;
    showVideoDialog.value = false;
    shouldAutoScroll.value = false;
    isScrollBottom.value = false;
    saveScrollTop();
  }

  return {
    showExtension,
    pageTransition,
    showVideoDialog,
    notDialogShow,
    shouldAutoScroll,
    isScrollBottom,
    scrollBottom,
    scrollReplyMsg,
    saveScrollTop,
    scrollTop,
    resetUI,
  };
}


