# Agarly

Agarly is a web-based platform designed to enable individuals to **rent and lend personal assets** within their local communities. Through map-based item discovery and an intuitive interface, the platform promotes sustainable consumption, cost efficiency, and resource sharing.

---

## 📌 Objective

Agarly aims to deliver a fully functional web application that allows users to:

- Browse available items for rent  
- List their own items  
- Manage rental requests  
- Discover items through an integrated **interactive map**

The platform creates a seamless ecosystem for renting and lending items while improving local accessibility.

---

## 🎯 Motivation

Many individuals purchase tools, furniture, or outdoor equipment that remain underused. Meanwhile, their neighbors often own similar idle resources. This leads to:

- Financial inefficiency  
- Increased environmental waste  
- Unnecessary redundancy  

Agarly addresses these issues by enabling a **local rental marketplace** that:

- Reduces costs  
- Supports sustainable consumption  
- Promotes community interaction  
- Builds trust within neighborhoods  

The goal is to provide an efficient and user-friendly rental workflow for authenticated users.

---

## 📚 Background

Agarly is built on principles of **HCI**, **UI/UX design**, and **software engineering**.

### **Tech Stack**
- **Frontend:** Angular  
- **Backend:** Spring Boot  
- **Mapping:** Leaflet.js  
- **Database:** Stores users, items, requests, categories, payments, etc.

### **System Architecture**
The system includes:

- User authentication & role-based access control  
- CRUD operations for item listings  
- Administrative approval of suggested categories  
- UML-modeled entities for:
  - Users  
  - Admins  
  - Rental Items  
  - Requests  
  - Payment Service  
  - Chat Service (optional)

---

## 🛠️ Approach

### **1. User Research & Requirements Gathering**
- Conduct surveys to understand user needs and trust factors in peer-to-peer rentals.

### **2. UI/UX Design**
- Create high-fidelity Figma prototypes focusing on clarity, simplicity, and safety.

### **3. Core Modules**

#### **• User Module**
- Registration, login, authentication, and profile management

#### **• Item Module**
- Item listing creation, editing, deletion, and search functionality

#### **• Request Module**
- Rental request handling, status updates, and tracking

#### **• Admin Module**
- User management, category approval, and system oversight

#### **• Map Integration**
- Leaflet.js for geographic visualization of available items

### **4. Frontend Development (Angular)**
- Implement UI and core modules based on the prototypes

### **5. Backend Development (Spring Boot)**
- Develop RESTful APIs for users, items, and requests  
- Implement authentication and validation logic

### **6. Testing & Evaluation**
- Perform usability tests  
- Refine workflows based on feedback

### **7. Deployment & Feedback**
- Integrate frontend and backend  
- Test full functionality  
- Collect user feedback for the final presentation

### **8. Optional Module**
- **Chat System:** May be introduced after core components are complete for messaging between lenders and renters.

---

## 📦 Status

Agarly is currently in the development phase with core features being implemented. Future enhancements may include messaging, reviews, and advanced payment integration.
