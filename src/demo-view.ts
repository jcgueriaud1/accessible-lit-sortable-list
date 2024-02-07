import {LitElement, html, css, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {animate, fadeOut, flyBelow} from '@lit-labs/motion';

export default interface Todo {
  id: number;
  task: string;
}

enum Key {
  SPACE= "Space",
  UP_ARROW= "ArrowUp",
  DOWN_ARROW = "ArrowDown",
  ESC = "Escape"
}
@customElement('demo-view')
class DemoView extends LitElement {

  static styles = css`
    :host {
    display: block;
    --lumo-space-xs: 0.25rem;
    --lumo-space-s: 0.5rem;
    --lumo-space-m: 1rem;
    --lumo-space-l: 1.5rem;
    --lumo-space-xl: 2.5rem;
    padding: var(--lumo-space-l);
    --lumo-tint-40pct: hsla(0, 0%, 100%, 0.57);
    --lumo-primary-color: hsl(214, 100%, 48%);
    --lumo-primary-color-50pct: hsla(214, 100%, 49%, 0.76);
    --lumo-primary-color-10pct: hsla(214, 100%, 60%, 0.13);
    --lumo-primary-text-color: hsl(214, 100%, 43%);
    --lumo-primary-contrast-color: #fff;
      --lumo-success-color: hsl(145, 72%, 30%);
          --lumo-shade-10pct: hsla(214, 57%, 24%, 0.1);
    --lumo-shade-20pct: hsla(214, 53%, 23%, 0.16);
    --lumo-shade-30pct: hsla(214, 50%, 22%, 0.26);
    --lumo-shade-40pct: hsla(214, 47%, 21%, 0.38);
    --lumo-shade-50pct: hsla(214, 45%, 20%, 0.52);

      --lumo-box-shadow-s: 0 2px 4px -1px var(--lumo-shade-20pct), 0 3px 12px -1px var(--lumo-shade-30pct);
}

.dashboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--lumo-space-m);
    row-gap: var(--lumo-space-m);
    height: 100%;
}

.dashboard__column {
    height: 100%;
    background-color: var(--lumo-primary-color-10pct);
    border-radius: var(--lumo-space-xs);
    box-shadow: var(--lumo-box-shadow-s);
    margin:var(--lumo-space-m);
}


.dashboard__column__title {
    background-color: var(--lumo-primary-color);
    color: var(--lumo-primary-contrast-color);
    border-radius: var(--lumo-space-xs) var(--lumo-space-xs) 0 0;
    padding: var(--lumo-space-s);
}

.dashboard__column--inprogress .dashboard__column__title {
    background-color: var(--lumo-secondary-text-color);
}

.dashboard__column--complete .dashboard__column__title {
    background-color: var(--lumo-success-color);
}

.dashboard__column__task {
    background-color: var(--lumo-primary-contrast-color);
    padding: var(--lumo-space-s);
    margin: var(--lumo-space-s);
    border-radius: var(--lumo-space-xs);
    box-shadow: var(--lumo-box-shadow-s);
}

.dashboard__column__task__title {
    font-weight: bold;
}

.dashboard__column__task__description {
    color: var(--lumo-contrast-70pct);
    padding-top: var(--lumo-space-s);
    font-style: italic;
}

.ignore-elements {
    font-style: italic;
    opacity: 80%;
}

.sortable-ghost {
    opacity:70%;
}

.sortable-chosen {
    background-color: #919191;
}

.sortable-drag {
    background-color:gray;
    opacity:50%;
}
.sort {
    height: 100%;
}

    .selected {
      font-style: italic;
      background-color: var(--lumo-shade-10pct);
    }

    ol {
      list-style-type: none;
    }
  `;

  @property({type: Array}) data = [
    {id: 1, task: 'Go running.'},
    {id: 2, task: 'Strength training'},
    {id: 3, task: 'Walk with friends.'},
    {id: 4, task: 'Feed the cats.'},
    {id: 5, task: 'Shop for dinner.'},
    {id: 6, task: 'Order clothes.'},
    {id: 7, task: 'BBQ!'},
  ];

  @property({type: Array})
  sortedData = this.data;

  @property()
  dragItem?:Todo;

  @property()
  dragItemIndex?:number;

  @property()
  private _keyboardDragMode:boolean = false;

  @property()
  dropItemIndex?:number;

  @property()
  currentIndex:number = 0;

  @property()
  liveText:string = "";

  focusedElement?: HTMLElement;

  @query('#list')
  private _list?:HTMLElement;

  render() {
    return html`
      <h1>Task Dashboard - Drag and Drop</h1>
      <span aria-live="assertive">${this.liveText}</span>
      <span id="operation" class="assistive-text">
        Press Spacebar to reorder
      </span>
      <div class="dashboard">
        <div class="dashboard__column">
            <div id="title" class="dashboard__column__title">TODO</div>
            <ol id="list" class="sort" role="listbox" aria-labelledby="title"
                aria-describedby="operation"
                 @drop="${ (e:DragEvent) => this.onDropAction(e)}"
                 @dragover="${ (e:DragEvent) => this.onDragOverAction(e)}"
                >
              ${repeat(
                this.sortedData,
               item => item.id,
                (item, index) => html`
              <li class="dashboard__column__task ${(this.dragItem && this.dragItem.id == item.id)? "selected": ""}"

                  aria-describedby="operation"
                  @keydown=${(e:KeyboardEvent) => this._keyboardHandler(e, item)}
                  tabindex="${((this._keyboardDragMode)?(this.dragItem && this.dragItem.id == item.id):(this.currentIndex == index))? "0": "-1"}"
                  ?aria-selected=${((this._keyboardDragMode)?(this.dragItem && this.dragItem.id == item.id):(this.currentIndex == index))}
                  role="option"
                  data-index=${index}
                  draggable="${this.dragItemIndex === undefined}"
                  @dragstart="${(e: DragEvent) => this.onDragAction(e, item, index)}"
                  @dragend="${ (e:DragEvent) => this.onDragEndAction(e, item)}">
                    ${item.task}
              </li>`)}
            </ol>
        </div>
      </div>`;
  }

  private _keyboardHandler(event: KeyboardEvent, item: Todo) {

    if (event.metaKey || event.ctrlKey) {
      return;
    }

    if (event.code === Key.SPACE) {

      // space key - toggle mode Normal <-> Drag and drop
      if (this.dragItemIndex == undefined) {
        // Drag and drop mode
        if ((event.target instanceof Element) && (event.target as Element).hasAttribute("data-index")) {
          this._keyboardDragMode = true;
          const index = event.target.getAttribute("data-index");
          if (index !== undefined) {
            const numericIndex = Number(index);
            this.dragItemIndex = numericIndex;
            this.dropItemIndex = numericIndex;
            this.dragItem = item;
            this.liveText = `${this.dragItem.task}, grabbed. Current position in list: ${this.dragItemIndex + 1} of ${this.data.length}. Press up and down arrow keys to change position, Spacebar to drop, Escape key to cancel.`;
          }
        }
      } else {
        // Back to normal mode
        // reorder if needed
        if (this.dropItemIndex !== undefined) {
          this.liveText = `Item ${this.dragItem!.task}, dropped. Final position in list: ${this.dropItemIndex + 1} of ${this.data.length}.`;
          this.data = [...this.reorderList()];
          this.currentIndex = this.dropItemIndex;
        }
        this._resetKeyboardDragMode();
      }
      event.preventDefault();
    } else if (event.key === Key.UP_ARROW) {
      this._keyboardPrevious(event.target as HTMLElement);
      event.preventDefault();
    } else if (event.key === Key.DOWN_ARROW) {
      this._keyboardNext(event.target as HTMLElement);
      event.preventDefault();
    } else if (event.key === Key.ESC) {
      this.liveText = `${this.dragItem!.task} reorder cancelled.`;
      this._resetKeyboardDragMode();
      event.preventDefault();
    }
  }

  private _resetKeyboardDragMode() {
    this._keyboardDragMode = false;
    this.dragItemIndex = undefined;
    this.dropItemIndex = undefined;
    this.dragItem = undefined;
    this.focusedElement = undefined;
  }

  private onDragAction(event: DragEvent, todo: Todo, index: number) {
    if (event.dataTransfer && event.target && event.currentTarget) {
      event.dataTransfer
        .setData('text/plain', String(todo.id));

      if (todo) {
        this.dragItemIndex =  index;
      }
    }
  }

  private onDragEndAction(event: DragEvent, todo: Todo) {
    if (event.dataTransfer && event.target && event.currentTarget) {
      this.dragItemIndex = undefined;
      this.dropItemIndex = undefined;
    }
  }
  updated(changedProperties: Map<string, any>) {

    if (changedProperties.has('_keyboardDragMode')) {
      // focus the item
      if (this._list) {
        (this._list.children[this.currentIndex] as HTMLElement).focus();
      }
    } else if (changedProperties.has('dropItemIndex')) {
      // refocus the element if needed
      if (this.focusedElement) {
        console.error("refocus on " + this.focusedElement.textContent)
        this.focusedElement.focus();
      }
    }
  }
  private reorderList() {
    if (this.dragItemIndex !== undefined && this.dropItemIndex !== undefined && (this.dropItemIndex !== this.dragItemIndex)) {
      return this.move([...this.data], this.dragItemIndex, this.dropItemIndex);
    } else {
      return [...this.data];
    }
  }
  private move(arr: Array<Todo>, fromIndex: number, toIndex: number) {
    const newArr = [...arr];
    newArr.splice(toIndex, 0, newArr.splice(fromIndex, 1)[0]);
    return newArr;
  }
  private onDragOverAction(event: DragEvent) {
    //console.log("onDragOverAction");
    event.preventDefault();
    // set the new index
    if (event.target instanceof Element) {
      const before = (event.offsetY - (event.target.clientHeight / 2)) < 1;
      if ( event.target.hasAttribute("data-index")) {
        const index = event.target.getAttribute("data-index");
        if (index !== undefined) {
          const numericIndex = Number(index);
          this.dropItemIndex = (before && numericIndex > 0) ? numericIndex - 1 : numericIndex;
        }
      }
    }
  }
  willUpdate(changedProperties: PropertyValues<this>) {
    // only need to check changed properties for an expensive computation.
    if (changedProperties.has('dropItemIndex') && !changedProperties.has('data') ) {
      // don't recalculate when the data is updated
      this.sortedData = [...this.reorderList()];
    } else if (!changedProperties.has('dropItemIndex') && changedProperties.has('data')) {
      this.sortedData = [...this.data];
    }
  }
  private onDropAction(event:DragEvent) {
    if (event.dataTransfer && event.target && event.currentTarget) {
      const id = parseInt(event
        .dataTransfer
        .getData('text'));
      event.dataTransfer
        .clearData();
      if (this.dropItemIndex !== undefined) {
        this.data = [...this.reorderList()];
        this._resetKeyboardDragMode();
      }
    }
  }

  private _keyboardNext(item: HTMLElement) {
    this._keyboardNavigation(item,1);
  }
  private _keyboardPrevious(item: HTMLElement) {
    this._keyboardNavigation(item, -1);
  }

  private _keyboardNavigation(item: HTMLElement, increment: -1 | 1) {
    if (this._keyboardDragMode && this.dropItemIndex !== undefined) {
      let newIndex = this.dropItemIndex + increment;
      if (newIndex >= 0 && newIndex < this.data.length) {
        this.dropItemIndex = newIndex;
        this.focusedElement = item;
        // On Chrome + VoiceOver the item so the update is announced by the screen reader because we are focusing manually the item
        // On Safari + VoiceOver, it's not announced so we keep the announcement for now
         this.liveText = `${this.dragItem?.task}. Current position in list:  ${this.dropItemIndex + 1} of ${this.data.length}.`;
      }
    } else {
      // no keyboardMode
      let newIndex = this.currentIndex + increment;
      if (newIndex >= 0 && newIndex < this.data.length) {
        this.currentIndex = newIndex;
        // focus the item
        if (this._list) {
          (this._list.children[this.currentIndex] as HTMLElement).focus();
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-view': DemoView
  }
}



