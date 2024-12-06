<template>
  <div class="container">
    <div class="row">
      <!-- Lesson Creation Form -->
      <div class="col-md-3 card mr-2">
        <h5 class="mt-3 text-center">Create New Lesson</h5>
        <form @submit.prevent="createLesson" class="card-body">
          <div class="form-group mb-2">
            <input
              v-model="newLesson.subject"
              type="text"
              class="form-control form-control-sm"
              placeholder="Enter Subject"
              required
            />
          </div>
          <div class="form-group mb-2">
            <input
              v-model="newLesson.location"
              type="text"
              class="form-control form-control-sm"
              placeholder="Enter Location"
              required
            />
          </div>
          <div class="form-group mb-2">
            <input
              v-model="newLesson.price"
              type="number"
              class="form-control form-control-sm"
              placeholder="Enter Price"
              required
            />
          </div>
          <div class="form-group mb-3">
            <input
              v-model="newLesson.spaces"
              type="number"
              class="form-control form-control-sm"
              placeholder="Enter Spaces"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-sm w-100">
            Add Lesson
          </button>
        </form>
        <div v-if="lessonCreationError" class="text-danger mt-2 text-center">
          Error creating lesson. Please try again.
        </div>
        <div v-if="lessonCreationSuccess" class="text-success mt-2 text-center">
          Lesson created successfully!
        </div>
      </div>

      <!-- Lesson Display -->
      <div class="col-md-9 card">
        <div class="card-body">
          <!-- Search and Filter Section -->
          <div class="row mb-3">
            <div class="col-md-4">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control form-control-sm"
                placeholder="Search Lessons"
                @input="filterLessons"
              />
            </div>
            <div class="col-md-8 d-flex">
              <div>
                <label class="form-check-label">
                  <input
                    type="radio"
                    value="subject"
                    v-model="sortAttribute"
                    class="form-check-input"
                    @change="sortLessons"
                  />
                  Subject&nbsp;
                </label>
              </div>
              <div>
                <label class="form-check-label">
                  <input
                    type="radio"
                    value="location"
                    v-model="sortAttribute"
                    class="form-check-input"
                    @change="sortLessons"
                  />
                  Location&nbsp;
                </label>
              </div>
              <div>
                <label class="form-check-label">
                  <input
                    type="radio"
                    value="price"
                    v-model="sortAttribute"
                    class="form-check-input"
                    @change="sortLessons"
                  />
                  Price&nbsp;
                </label>
                
              </div>
            </div>
          </div>

          <!-- Lesson List -->
          <div class="lesson-list row">
            <div
              v-for="lesson in filteredLessons"
              :key="lesson._id"
              class="card colmb-3 card-body mb-2"
            >
              <h6 class="mb-1">{{ lesson.subject }}</h6>
              <p class="mb-1">{{ lesson.location }}</p>
              <p class="mb-1">${{ lesson.price }}</p>
              <p>Spaces Left: {{ lesson.spaces }}</p>
              <button
                @click="addToCart(lesson)"
                class="btn btn-primary btn-sm"
                :disabled="lesson.spaces === 0"
              >
                {{ lesson.spaces > 0 ? "Add to Cart" : "Sold Out" }}
              </button>
            </div>
          </div>
        </div>

     <!-- Cart Section -->
<div v-if="cart.length > 0" class="card mt-4">
  <div class="card-header">
    <h6>Your Cart</h6>
  </div>
  <div class="card-body">
    <div
      v-for="(lesson, index) in cart"
      :key="index"
      class="cart-item mb-2 d-flex justify-content-between"
    >
      <span>{{ lesson.subject }} - ${{ lesson.price }}</span>
      <button
        @click="removeFromCart(index)"
        class="btn btn-danger btn-sm"
      >
        Remove
      </button>
    </div>
    <button
      @click="toggleCheckout"
      class="btn btn-success btn-sm w-100 mt-2"
      :disabled="cart.length === 0"
    >
      Checkout
    </button>
  </div>
</div>

<!-- Checkout Section -->
<div v-if="showCheckout">
  <form id="checkout-form" class="p-4 bg-light rounded shadow-sm mt-3">
    <h3 class="mb-4 text-center">Checkout</h3>
    
    <!-- Name Input -->
    <div class="mb-3">
      <label for="name" class="form-label">Name:</label>
      <input
        type="text"
        id="name"
        class="form-control"
        placeholder="Enter your name"
        @input="validateForm"
        v-model="name"
      />
    </div>
    
    <!-- Phone Input -->
    <div class="mb-3">
      <label for="phone" class="form-label">Phone:</label>
      <input
        type="text"
        id="phone"
        class="form-control"
        placeholder="Enter your phone number"
        @input="validateForm"
        v-model="phone"
      />
    </div>

    <!-- Checkout Button -->
    <button
      type="submit"
      class="btn btn-primary w-100"
      @click="submitOrder"
    >
      Checkout
    </button>
  </form>
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
      name: "",
      phone: "",
      showCheckout: false,
      isNameValid: false,
      isPhoneValid: false,
      isFormValid: false,
      searchQuery: "",
      sortAttribute: "subject",
      newLesson: {
        subject: "",
        location: "",
        price: null,
        spaces: null,
      },
      lessonCreationError: false,
      lessonCreationSuccess: false,
    };
  },
  computed: {
    filteredLessons() {
      return this.lessons.filter((lesson) =>
        lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    isFormValidated() {
      return this.isNameValid && this.isPhoneValid && this.name && this.phone;
    },
  },
  methods: {
    async fetchLessons() {
      try {
        const response = await fetch("http://localhost:5000/lessons");
        this.lessons = await response.json();
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    },
    createLesson() {
      fetch("http://localhost:5000/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.newLesson),
      })
        .then((response) => response.json())
        .then((lesson) => {
          this.lessonCreationSuccess = true;
          this.lessons.push(lesson);
          this.newLesson = { subject: "", location: "", price: null, spaces: null };
        })
        .catch((error) => {
          console.error("Error creating lesson:", error);
          this.lessonCreationError = true;
        });
    },
    sortLessons() {
      this.lessons.sort((a, b) => {
        return typeof a[this.sortAttribute] === "string"
          ? a[this.sortAttribute].localeCompare(b[this.sortAttribute])
          : a[this.sortAttribute] - b[this.sortAttribute];
      });
    },
    addToCart(lesson) {
      lesson.spaces -= 1;
      this.cart.push(lesson);
    },
    removeFromCart(index) {
      const lesson = this.cart[index];
      lesson.spaces += 1;
      this.cart.splice(index, 1);
    },
    checkout() {
      alert("Proceeding to checkout!");
      this.cart = [];
    },
    toggleCheckout() {
      this.showCheckout = !this.showCheckout; // Toggle checkout visibility
    },
  },
  mounted() {
    this.fetchLessons();
  },
  validateForm() {
      const nameRegex = /^[a-zA-Z\s]+$/;
      const phoneRegex = /^[0-9]+$/;

      this.isNameValid = nameRegex.test(this.name);
      this.isPhoneValid = phoneRegex.test(this.phone);
    },
    submitOrder() {
      alert(`Order submitted!`);
      
      // Optionally, you can reset the form after submission
      this.name = '';
      this.phone = '';
    }
    
};
</script>

<style scoped>
/* Updated styling for a professional look */
.container {
  padding: 20px;
}
.card {
  border-radius: 8px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
.card-body {
  padding: 10px;
}
.lesson-list {
  max-height: 300px;
  overflow-y: auto;
}
button {
  border-radius: 4px;
}
</style>
