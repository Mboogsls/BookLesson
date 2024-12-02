<template>
  <div>
    <button v-if="lesson.spaces > 0" @click="addToCart(lesson)">Add to Cart</button>
  </div>
</template>

<script>
export default {
  methods: {
    addToCart(lesson) {
      lesson.spaces--;
      this.cart.push(lesson);
      this.updateLessonSpace(lesson);
    },
    async updateLessonSpace(lesson) {
      await fetch(`https://localhost:5000/lessons/${lesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spaces: lesson.spaces }),
      });
    }
  }
};
</script>
