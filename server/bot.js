import TelegramBot from 'node-telegram-bot-api';
import { db } from './db.js';

const BOT_TOKEN = process.env.BOT_TOKEN || '8812053297:AAHYqr7B5dECnRi6r2cFSpKy-qOjD0cUWSk';
const envAdminIds = process.env.ADMIN_CHAT_ID ? process.env.ADMIN_CHAT_ID.split(',').map(s => s.trim()) : [];
const ADMIN_CHAT_IDS = Array.from(new Set([...envAdminIds, '5744542264', '7146730534']));

let bot = null;

export function initBot() {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    console.warn('Telegram Bot Token not configured!');
    return null;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('✨ Telegram Bot initialized & polling started...');

    // Handle /start command
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'Hurmatli mijoz';

      bot.sendMessage(
        chatId,
        `✨ **VELARIS - Parfume Atelier** ga xush kelibsiz, ${firstName}!\n\n` +
        `Fransiyaning eng sara va lyuks parfyumeriya mahsulotlarini Telegram Mini App orqali buyurtma qiling.\n\n` +
        `Pastdagi tugma orqali ilovani oching 👇`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🛍️ Do\'konni Ochish (Mini App)',
                  web_app: { url: process.env.MINI_APP_URL || 'https://velaris-parfume.vercel.app' }
                }
              ]
            ]
          }
        }
      );
    });

    // Handle Admin Callback Buttons (Inline Keyboards)
    bot.on('callback_query', async (query) => {
      const { id, data, message } = query;
      if (!data) return;

      const [action, orderIdStr] = data.split(':');
      const orderId = parseInt(orderIdStr, 10);

      if (isNaN(orderId)) return;

      let newStatus = '';
      let statusIcon = '';

      switch (action) {
        case 'status_confirm':
          newStatus = 'Tayyorlanmoqda';
          statusIcon = '⚙️';
          break;
        case 'status_ship':
          newStatus = 'Jo\'natildi';
          statusIcon = '🚚';
          break;
        case 'status_deliver':
          newStatus = 'Yetkazildi';
          statusIcon = '✅';
          break;
        case 'status_cancel':
          newStatus = 'Bekor qilindi';
          statusIcon = '❌';
          break;
        default:
          return;
      }

      try {
        // Update database
        const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
        stmt.run(newStatus, orderId);

        // Fetch updated order info
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

        if (order) {
          try {
            await bot.answerCallbackQuery(id, {
              text: `Buyurtma #${orderId} maqomi: ${newStatus}`,
              show_alert: false,
            });
          } catch (e) {
            // ignore callback answer error
          }

          // Re-generate updated message text
          const updatedMessageText = formatOrderMessage(order);
          const replyMarkup = { inline_keyboard: getAdminInlineKeyboard(orderId, newStatus) };

          try {
            // Try updating standard text message
            await bot.editMessageText(updatedMessageText, {
              chat_id: message.chat.id,
              message_id: message.message_id,
              parse_mode: 'HTML',
              reply_markup: replyMarkup
            });
          } catch (e) {
            // If message is a photo message with caption, edit caption!
            try {
              await bot.editMessageCaption(updatedMessageText, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                parse_mode: 'HTML',
                reply_markup: replyMarkup
              });
            } catch (err2) {
              console.error('Error editing photo caption via bot:', err2);
            }
          }
        }
      } catch (err) {
        console.error('Error updating order status via bot:', err);
        bot.answerCallbackQuery(id, { text: 'Xatolik yuz berdi!', show_alert: true });
      }
    });

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram Bot:', error);
    return null;
  }
}

// Format Order Notification Message for Telegram HTML
export function formatOrderMessage(order) {
  const items = JSON.parse(order.items_json || '[]');
  const address = JSON.parse(order.address_json || '{}');

  let itemsList = items
    .map(
      (item, idx) =>
        `   ${idx + 1}. <b>${item.name}</b> (${item.size})\n` +
        `      <i>Soni:</i> ${item.quantity} dona x ${item.unitPrice.toLocaleString('uz-UZ')} so'm = <b>${item.totalPrice.toLocaleString('uz-UZ')} so'm</b>`
    )
    .join('\n');

  const fullAddress = [
    address.region,
    address.district,
    address.mahalla ? `${address.mahalla} mfy` : '',
    address.street ? `${address.street} ko'chasi` : '',
    address.house ? `${address.house}-uy` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const mapsLink =
    order.location_lat && order.location_lng
      ? `<a href="https://www.google.com/maps?q=${order.location_lat},${order.location_lng}">🗺️ Xaritada Ko'rish (Google Maps)</a>`
      : '📍 <i>Koordinatalar ko\'rsatilmadi</i>';

  const deliveryText =
    order.delivery_type === 'courier'
      ? `🚚 <b>Kuryer orqali yetkazish</b> (${order.delivery_fee.toLocaleString('uz-UZ')} so'm)`
      : '🏬 <b>Olib ketish (Self-pickup)</b> (Bepul)';

  return (
    `🛍️ <b>YANGI BUYURTMA #${order.id}</b>\n\n` +
    `👤 <b>Mijoz:</b> ${order.customer_name}\n` +
    `📞 <b>Tel:</b> <code>${order.customer_phone}</code>\n\n` +
    `📍 <b>Manzil:</b> ${fullAddress || 'Ko\'rsatilmadi'}\n` +
    `${mapsLink}\n\n` +
    `📦 <b>MAHSULOTLAR:</b>\n${itemsList}\n\n` +
    `${deliveryText}\n` +
    `💰 <b>JAMI SUMMA:</b> <code>${order.total_amount.toLocaleString('uz-UZ')} so'm</code>\n\n` +
    `📊 <b>Hozirgi status:</b> <b>${order.status}</b>`
  );
}

// Generate inline keyboard based on current status
export function getAdminInlineKeyboard(orderId, currentStatus) {
  const keyboard = [];

  if (currentStatus === 'To\'lov kutilmoqda' || currentStatus === 'Qabul qilindi') {
    keyboard.push([
      { text: '✅ To\'lovni Tasdiqlash (Tayyorlanmoqda)', callback_data: `status_confirm:${orderId}` },
      { text: '❌ Rad etish / Bekor qilish', callback_data: `status_cancel:${orderId}` }
    ]);
  } else if (currentStatus === 'Tayyorlanmoqda') {
    keyboard.push([
      { text: '🚚 Jo\'natish (Kuryerga berildi)', callback_data: `status_ship:${orderId}` },
      { text: '❌ Bekor qilish', callback_data: `status_cancel:${orderId}` }
    ]);
  } else if (currentStatus === 'Jo\'natildi') {
    keyboard.push([
      { text: '✅ Yetkazildi (Bajarildi)', callback_data: `status_deliver:${orderId}` },
      { text: '❌ Bekor qilish', callback_data: `status_cancel:${orderId}` }
    ]);
  } else {
    keyboard.push([
      { text: '⚙️ Qayta tayyorlash', callback_data: `status_confirm:${orderId}` }
    ]);
  }

  return keyboard;
}

// Send Order Alert to Admins
export async function sendOrderNotificationToAdmin(order) {
  if (!bot) {
    console.log('Bot is not active, skipping notification to admin.');
    return;
  }

  const isReceipt = order.status === 'To\'lov kutilmoqda';
  const prefixText = isReceipt
    ? `💳 <b>YANGI TO'LOV CHEKI (BUYURTMA #${order.id})</b>\n⚠️ <i>Mijoz to'lov screenshotini yukladi. To'lov qilindi, tasdiqlaysizmi?</i>\n\n`
    : '';

  const messageText = prefixText + formatOrderMessage(order);
  const inlineKeyboard = getAdminInlineKeyboard(order.id, order.status);

  let photoSource = null;
  if (order.payment_receipt_image) {
    if (order.payment_receipt_image.startsWith('http')) {
      photoSource = order.payment_receipt_image;
    } else if (order.payment_receipt_image.startsWith('data:image')) {
      const base64Data = order.payment_receipt_image.replace(/^data:image\/\w+;base64,/, '');
      photoSource = Buffer.from(base64Data, 'base64');
    }
  }

  for (const chatId of ADMIN_CHAT_IDS) {
    try {
      if (photoSource) {
        await bot.sendPhoto(chatId, photoSource, {
          caption: messageText,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      } else {
        await bot.sendMessage(chatId, messageText, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }

      // If coordinates exist, send telegram location pin too!
      if (order.location_lat && order.location_lng) {
        await bot.sendLocation(chatId, order.location_lat, order.location_lng);
      }
      console.log(`Order #${order.id} notification successfully sent to Admin Telegram ${chatId}!`);
    } catch (err) {
      console.error(`Failed to send Telegram notification to Admin ${chatId}:`, err);
    }
  }
}
