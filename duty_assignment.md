## **Person 1: User Identity & Financials**
**Focus**: Managing user profiles, security, and the **Payment/Wallet** system.

### **Frontend Duties**
*   **Profile & Settings**: Implement `EditProfileComponent` and `SettingsComponent`.
*   **Payment Methods**: UI to add/manage credit cards or bank accounts in `PaymentComponent`.
*   **Transaction History**: View past payments and earnings in `DashboardComponent`.

### **Backend Java Files to Create**
| Type | File Name | Purpose |
| :--- | :--- | :--- |
| **Entity** | `PaymentMethod.java` | Stores tokenized card info (never raw details). |
| **Entity** | `Transaction.java` | Records money movement (Amount, Type, Status). |
| **Controller** | `PaymentController.java` | Endpoints: `POST /payments/charge`, `GET /payments/history`. |
| **Controller** | `UserProfileController.java` | Endpoints: `PUT /users/profile`, `PATCH /users/password`. |
| **Service** | `PaymentService.java` | Integration with Gateway (Stripe/PayPal) and internal ledger. |
| **Service** | `UserProfileService.java` | Logic for user updates. |
| **Repository** | `TransactionRepository.java` | DB access for financial records. |

---

## **Person 2: Item Management & Media**
**Focus**: The core "Inventory" system and handling media assets.

### **Frontend Duties**
*   **Add Item Wizard**: Multi-step form in `AddItemComponent` (Details -> Location -> Images).
*   **My Inventory**: Dashboard view for managing active listings.
*   **Image Uploader**: Reusable component for drag-and-drop image uploading.

### **Backend Java Files to Create**
| Type | File Name | Purpose |
| :--- | :--- | :--- |
| **Entity** | `Item.java` | Represents an item for rent. |
| **Entity** | `ItemImage.java` | Stores image metadata and URLs. |
| **Controller** | `ItemController.java` | Endpoints: `POST /items`, `PUT /items/{id}`, `DELETE /items/{id}`. |
| **Service** | `ItemService.java` | Business logic for item validation and ownership. |
| **Service** | `ImageStorageService.java` | Handles file upload to disk/S3 and resizing. |
| **Repository** | `ItemRepository.java` | DB access for Items. |

---

## **Person 3: Search, Discovery & Home**
**Focus**: The "Borrower" experience, filtering, and public data.

### **Frontend Duties**
*   **Advanced Search**: `SearchResultsComponent` with dynamic filters (Category, Price, Distance).
*   **Home Feed**: `HomeComponent` with "Featured" and "Trending" algorithms.
*   **Item View**: `ItemDetailsComponent` (Public view).

### **Backend Java Files to Create**
| Type | File Name | Purpose |
| :--- | :--- | :--- |
| **DTO** | `SearchCriteria.java` | Container for filter parameters. |
| **Controller** | `SearchController.java` | Endpoints: `GET /items/search`, `GET /items/feed`. |
| **Service** | `SearchService.java` | Implements specification-based filtering. |
| **Specification**| `ItemSpecification.java` | Dynamic SQL generation for filters. |

---

## **Person 4: Booking Lifecycle & Requests**
**Focus**: The "Contract" between users. Handling the state machine of a rental.

### **Frontend Duties**
*   **Booking Request**: `BookItemComponent` (Date selection, Duration calculation).
*   **Request Manager**: `RequestsComponent` (Inbox for Lenders to Approve/Decline).
*   **Booking Status**: Visual timeline of the rental (Pending -> Active -> Returned).

### **Backend Java Files to Create**
| Type | File Name | Purpose |
| :--- | :--- | :--- |
| **Entity** | `Booking.java` | Links User, Item, and Status. |
| **Enum** | `BookingStatus.java` | States: PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED, CANCELLED. |
| **Controller** | `BookingController.java` | Endpoints: `POST /bookings`, `PUT /bookings/{id}/status`. |
| **Service** | `BookingService.java` | Validates availability, handles status transitions. |
| **Repository** | `BookingRepository.java` | DB access for Bookings. |

---

## **Person 5: Governance (Admin, Reviews, Support)**
**Focus**: Platform health, trust, and user support.

### **Frontend Duties**
*   **Review System**: `StarRatingComponent` and `ReviewListComponent`.
*   **Support Portal**: `SupportComponent` for tickets.
*   **Admin Dashboard**: `AdminDashboardComponent` (User bans, Content moderation).

### **Backend Java Files to Create**
| Type | File Name | Purpose |
| :--- | :--- | :--- |
| **Entity** | `Review.java` | Rating and Comment data. |
| **Entity** | `SupportTicket.java` | User inquiries. |
| **Controller** | `ReviewController.java` | Endpoints: `POST /reviews`. |
| **Controller** | `AdminController.java` | Endpoints: `GET /admin/stats`, `PUT /admin/users/{id}/ban`. |
| **Service** | `ReviewService.java` | Calculates average ratings for items/users. |
| **Service** | `AdminService.java` | Aggregates system statistics. |
| **Repository** | `ReviewRepository.java` | DB access for Reviews. |
