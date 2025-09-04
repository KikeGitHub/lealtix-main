export function clearMessage(component: { message: any; messageType: any }, timeout: number = 5000): void {
  setTimeout(() => {
    component.message = null;
    component.messageType = null;
  }, timeout);
}

