import { Schema } from "mongoose";

export const AccountsSchema = new Schema ({
    googleId: {type: String, required: true},
    name: {type: String, required: true},
    lastName: {type: String, required: false},
    email: {type: String, unique: true, required: true},
    picture: {type: String, required: false},
    password: {type: String, required: false},
    color: {type: String, required: false},
    // username: {type: String, required: false},
    username: {
        type: String,
        required: false,  // Bu maydon ixtiyoriy bo'lishi mumkin
        // unique: true,     // Unique bo'lishi kerak, ammo null qiymatni qabul qiladi
        // validate: {
        //   validator: function(v) {
        //     // // Agar v null yoki bo'sh bo'lmasa, validator ishlaydi
        //     return v == null || v.trim() !== ''; // Agar qiymat mavjud bo'lsa, uni to'g'ri tekshirish
        //     // Agar `v` null yoki bo'sh bo'lsa, bu shartni tekshirmang
        //     if (v == null || v.trim() === '') return true;  // Bo'sh yoki null qiymatni qabul qilish
        //     // Aks holda, qiymat bo'sh emasligini tekshiring
        //     return v.trim() !== '';
        //   },
        //   message: 'Username cannot be empty or whitespace.'
        // }
      },

    accessToken: {type: String, required: false},
    refreshToken: {type: String, required: false},
    jwtToken: {type: String, required: false},
    
});

export const SeansSchema = new Schema ({
  account_id: {type: String, required: true},
  accessToken: {type: String, required: false},
  refreshToken: {type: String, required: false},
  jwtToken: {type: String, required: false},
});

// // Partial index: faqat null bo'lmagan username uchun unique index
// AccountsSchema.index(
//     { username: 1 },
//     { unique: true, partialFilterExpression: { username: { $ne: null } } }
//   );