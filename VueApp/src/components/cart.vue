<template>
  <div v-if="cart.length > 0">
    <button @click="viewCart">View Cart</button>
    <div v-if="showCart">
      <div v-for="(lesson, index) in cart" :key="index">
        <p>{{ lesson.subject }} - {{ lesson.location }} - {{ lesson.price }} - Spaces: {{ lesson.spaces }}</p>
        <button @click="removeFromCart(index)">Remove</button>
      </div>
      <button @click="checkout" :disabled="!validForm">Checkout</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cart: [],
      showCart: false,
      validForm: false,
      name: '',
      phone: ''
    };
  },
  methods: {
    viewCart() {
      this.showCart = !this.showCart;
    },
    removeFromCart(index) {
      const lesson = this.cart.splice(index, 1)[0];
      this.addToLessonList(lesson);
    },
    async addToLessonList(lesson) {
      lesson.spaces++;
      await fetch(`http://localhost:5000/lessons/${lesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaces: lesson.spaces }),
      });
    },
    checkout() {
      if (this.validForm) {
        alert('Order submitted');
      }
    }
  },
  watch: {
    name(value) {
      this.validForm = /^[a-zA-Z]+$/.test(value) && this.validPhone;
    },
    phone(value) {
      this.validForm = /^[0-9]+$/.test(value) && this.validName;
    }
  }
};
</script>
