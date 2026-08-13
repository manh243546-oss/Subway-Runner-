/**
 * Ultra Low-Latency Multi-Touch, Mouse Drag & Key Gesture Input Controller
 * Supports Swipe Gestures (Left, Right, Up, Down), Double Tap, Mouse Dragging, Keyboard WASD/Arrows.
 */

export type ActionCallback = (action: 'left' | 'right' | 'jump' | 'roll' | 'hoverboard') => void;

export class TouchManager {
  private element: HTMLElement;
  private onAction: ActionCallback;

  // Touch & Mouse state
  private startX: number = 0;
  private startY: number = 0;
  private isMouseDown: boolean = false;
  private lastTapTime: number = 0;
  private doubleTapFired: boolean = false; // Ngăn processSwipe chạy sau double-tap
  private swipeThreshold: number = 35; // Tăng lên 35px cho mobile dễ vuốt hơn
  private doubleTapTimeThreshold: number = 300; // ms between taps

  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private boundTouchCancel: (e: TouchEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(element: HTMLElement, onAction: ActionCallback) {
    this.element = element;
    this.onAction = onAction;

    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.boundTouchCancel = this.handleTouchCancel.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);

    this.attach();
  }

  public attach(): void {
    // Touch Events
    this.element.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.boundTouchCancel, { passive: true });

    // Mouse Drag Events for Desktop Canvas Swiping
    this.element.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);

    // Keyboard Events
    window.addEventListener('keydown', this.boundKeyDown);

    // Ngăn browser xử lý touch (scroll, zoom) trên canvas game
    (this.element as HTMLElement).style.touchAction = 'none';
    (this.element as HTMLElement).style.userSelect = 'none';
    (this.element as HTMLElement).style.webkitUserSelect = 'none';
  }

  public detach(): void {
    this.element.removeEventListener('touchstart', this.boundTouchStart);
    this.element.removeEventListener('touchmove', this.boundTouchMove);
    this.element.removeEventListener('touchend', this.boundTouchEnd);
    this.element.removeEventListener('touchcancel', this.boundTouchCancel);

    this.element.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);

    window.removeEventListener('keydown', this.boundKeyDown);

    // Khôi phục touch behavior bình thường khi game kết thúc
    (this.element as HTMLElement).style.touchAction = '';
    (this.element as HTMLElement).style.userSelect = '';
  }

  private triggerHaptic(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignored
      }
    }
  }

  // --- TOUCH HANDLERS ---
  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const now = performance.now();

      if (now - this.lastTapTime < this.doubleTapTimeThreshold && this.lastTapTime > 0) {
        // Double-tap detected → kích hoạt hoverboard, đặt flag để block processSwipe
        this.doubleTapFired = true;
        this.triggerHaptic();
        this.onAction('hoverboard');
        this.lastTapTime = 0;
        // KHÔNG update startX/Y khi double-tap → tránh processSwipe tính sai delta
      } else {
        // Lần chạm đầu → lưu coordinates và reset flag
        this.doubleTapFired = false;
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.lastTapTime = now;
      }
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.cancelable) {
      e.preventDefault();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length === 0) return;
    // Nếu vừa kích hoạt double-tap hoverboard thì không xử lý swipe
    if (this.doubleTapFired) {
      this.doubleTapFired = false;
      return;
    }
    const touch = e.changedTouches[0];
    this.processSwipe(touch.clientX, touch.clientY);
  }

  private handleTouchCancel(_e: TouchEvent): void {
    // Reset trạng thái khi touch bị gián đoạn (cuộc gọi, notification, v.v.)
    this.startX = 0;
    this.startY = 0;
    this.doubleTapFired = false;
    this.lastTapTime = 0;
  }

  // --- MOUSE SWIPE HANDLERS FOR DESKTOP ---
  private handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return; // Only main left click
    this.isMouseDown = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown) return;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    this.processSwipe(e.clientX, e.clientY);
  }

  // --- CORE GESTURE EVALUATOR ---
  private processSwipe(endX: number, endY: number): void {
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < this.swipeThreshold && absY < this.swipeThreshold) {
      return;
    }

    if (absX > absY) {
      // Horizontal Direction
      if (deltaX > 0) {
        this.triggerHaptic();
        this.onAction('right'); // Drag right -> Move right
      } else {
        this.triggerHaptic();
        this.onAction('left'); // Drag left -> Move left
      }
    } else {
      // Vertical Direction
      if (deltaY < 0) {
        this.triggerHaptic();
        this.onAction('jump'); // Drag up -> Jump
      } else {
        this.triggerHaptic();
        this.onAction('roll'); // Drag down -> Roll/Crouch
      }
    }
  }

  // --- KEYBOARD HANDLERS ---
  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore keyboard input when typing in input fields
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this.onAction('left');
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this.onAction('right');
        break;

      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        e.preventDefault();
        this.onAction('jump');
        break;

      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        this.onAction('roll');
        break;

      case 'e':
      case 'E':
      case 'Shift':
        e.preventDefault();
        this.onAction('hoverboard');
        break;
    }
  }
}

