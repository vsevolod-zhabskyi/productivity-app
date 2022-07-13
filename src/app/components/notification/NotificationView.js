/**
 * View part of Notification component that is
 * responsible for rendering notifications
 */
class NotificationView {
  render(text, type) {
    $(document).notification({ text, type });
  }
}

export default NotificationView;
