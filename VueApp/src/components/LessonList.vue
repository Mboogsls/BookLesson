<template>
  <div class="container">

  <div class="row">
    <!-- Lesson Creation Form -->
    <div style="margin-right: 5px;" class="col-md-3 card">
      <h5 class="mt-1">Create New Lesson</h5>
      <form class="card-body" @submit.prevent="createLesson">
        <div class="col-sm-12 mb-2">
           
          <input v-model="newLesson.subject" class="form-control form-control-sm" type="text" placeholder="Enter subject" required />
        </div>
        <div class="col-sm-12 mb-2">
           
          <input v-model="newLesson.location" class="form-control form-control-sm" type="text" placeholder="Enter location" required />
        </div>
        <div class="col-sm-12 mb-2">
           
          <input v-model="newLesson.price" class="form-control form-control-sm" type="number" placeholder="Enter price" required />
        </div>
        <div class="col-sm-12 mb-2">
          
          <input v-model="newLesson.spaces" class="form-control form-control-sm" type="number" placeholder="Enter number of spaces" required />
        </div>
        <button class="btn btn-success mt-3" type="submit">Create Lesson</button>
      </form>
      <div v-if="lessonCreationError" class="error-message">
        Error creating lesson. Please try again.
      </div>
      <div v-if="lessonCreationSuccess" class="success-message">
        Lesson created successfully!
      </div>
    </div>
    <div class="col-md-8 card">
      <div class="row  card-body">
        <div class="col-md-3">
         <input
        v-model="searchQuery"
        type="text"
        placeholder="Search lessons"
        @input="filterLessons"
        class="form-control form-control-sm"
      />
      <div>
      <label for="sort">Sort by:</label>
      <select class="form-control" v-model="sortAttribute" @change="sortLessons">
        <option value="subject">Subject</option>
        <option value="location">Location</option>
        <option value="price">Price</option>
        <option value="spaces">Spaces</option>
      </select>
    </div>

        </div>
     <div class="col-md-5">
     <header>
      <h5>Lesson Booking System</h5>
     
    </header>
    
    <div class="lesson-list">
      <div v-for="lesson in filteredLessons" :key="lesson._id" class="lesson">
        <img :src="lesson.image" alt="lesson image" />
        <h3>{{ lesson.subject }}</h3>
        <p>{{ lesson.location }}</p>
        <p>{{ lesson.price }} USD</p>
        <p>Spaces: {{ lesson.spaces }}</p>
        <button v-if="lesson.spaces > 0" @click="addToCart(lesson)">Add to Cart</button>
      </div>
    </div>

    <div v-if="cart.length > 0" class="cart">
      <button @click="viewCart">View Cart</button>
      <div v-if="showCart">
        <div v-for="(lesson, index) in cart" :key="index" class="cart-item">
          <p>{{ lesson.subject }} - {{ lesson.location }} - {{ lesson.price }} - Spaces: {{ lesson.spaces }}</p>
          <button @click="removeFromCart(index)">Remove</button>
        </div>
        <button @click="checkout" :disabled="!validForm">Checkout</button>
      </div>
    </div>

    <!-- Checkout Form -->
    <div v-if="showCart && validForm" class="checkout-form">
      <h2>Checkout</h2>
      <form @submit.prevent="submitOrder">
        <div>
          <label for="name">Full Name:</label>
          <input v-model="name" type="text" placeholder="Enter full name" required />
        </div>
        <div>
          <label for="phone">Phone Number:</label>
          <input v-model="phone" type="text" placeholder="Enter phone number" required />
        </div>
        <button type="submit">Submit Order</button>
      </form>
    </div>
    
    </div>
      </div>
    </div>
    </div>
    

  

   
  </div>
</template>

<script>
export default {
  data() {
    return {
      lessons: [],
      cart: [],
      searchQuery: '',
      sortAttribute: 'subject',
      showCart: false,
      name: '',
      phone: '',
      validForm: false,
      newLesson: {
        subject: '',
        location: '',
        price: null,
        spaces: null,
      },
      lessonCreationError: false,
      lessonCreationSuccess: false,
    };
  },
  mounted() {
    this.fetchLessons();
  },
  computed: {
    filteredLessons() {
      return this.lessons.filter((lesson) => {
        return (
          lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          lesson.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          lesson.price.toString().includes(this.searchQuery) ||
          lesson.spaces.toString().includes(this.searchQuery)
        );
      });
    },
  },
  methods: {
    async fetchLessons() {
      try {
        const response = await fetch('http://localhost:5000/lessons');
        this.lessons = await response.json();
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    },
    addToCart(lesson) {
      lesson.spaces--;
      this.cart.push(lesson);
      this.updateLessonSpace(lesson);
    },
    async updateLessonSpace(lesson) {
      try {
        await fetch(`http://localhost:5000/lessons/${lesson._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaces: lesson.spaces }),
        });
      } catch (error) {
        console.error('Error updating lesson space:', error);
      }
    },
    createLesson() {
      // Send POST request to create a new lesson
      const lessonData = this.newLesson;
      fetch('http://localhost:5000/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      })
        .then((response) => response.json())
        .then((data) => {
          this.lessonCreationSuccess = true;
          this.lessonCreationError = false;
          this.lessons.push(data); // Add the newly created lesson to the list
          this.newLesson = { subject: '', location: '', price: null, spaces: null }; // Clear the form
        })
        .catch((error) => {
          this.lessonCreationError = true;
          this.lessonCreationSuccess = false;
          console.error('Error creating lesson:', error);
        });
    },
    sortLessons() {
      this.lessons.sort((a, b) => {
        if (typeof a[this.sortAttribute] === 'string') {
          return a[this.sortAttribute].localeCompare(b[this.sortAttribute]);
        }
        return a[this.sortAttribute] - b[this.sortAttribute];
      });
    },
    checkout() {
      if (this.validForm) {
        alert('Proceeding to checkout...');
      }
    },
    submitOrder() {
      if (this.validForm) {
        const order = {
          name: this.name,
          phone: this.phone,
          lessons: this.cart,
        };
        this.placeOrder(order);
      }
    },
    async placeOrder(order) {
      try {
        const response = await fetch('http://localhost:5000/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        });
        const result = await response.json();
        if (result) {
          this.cart = [];
          this.name = '';
          this.phone = '';
          alert('Order placed successfully');
        }
      } catch (error) {
        console.error('Error placing order:', error);
      }
    },
  },
  watch: {
    name(value) {
      this.validForm = /^[a-zA-Z]+$/.test(value) && this.validPhone;
    },
    phone(value) {
      this.validForm = /^[0-9]+$/.test(value) && this.validName;
    },
  },
};
</script>

<style scoped>
/* Styling for the app */
#app {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}

.lesson-list {
  display: flex;
  flex-wrap: wrap;
}

.lesson {
  width: 48%;
  margin: 1%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.lesson img {
  width: 100%;
  height: auto;
}

.cart {
  margin-top: 20px;
}

.cart-item {
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.checkout-form {
  margin-top: 20px;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}

.create-lesson {
  margin-bottom: 20px;
}
</style>
