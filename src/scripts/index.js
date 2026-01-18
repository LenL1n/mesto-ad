/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addCard, deleteCardFromServer, changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoTitle = infoModalWindow.querySelector(".popup__title");
const infoText = infoModalWindow.querySelector(".popup__text");
const infoList = infoModalWindow.querySelector(".popup__list");
const infoContent = infoModalWindow.querySelector(".popup__info");

const logo = document.querySelector(".header__logo");

let userId = null;
let currentCardIdToDelete = null;
let currentCardElementToDelete = null;

const showLoading = (button, originalText, loadingText) => {
  button.textContent = loadingText;
  button.disabled = true;
};

const hideLoading = (button, originalText) => {
  button.textContent = originalText;
  button.disabled = false;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const originalButtonText = profileSubmitButton.textContent;
  showLoading(profileSubmitButton, originalButtonText, "Сохранение...");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      hideLoading(profileSubmitButton, originalButtonText);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const originalButtonText = avatarSubmitButton.textContent;
  showLoading(avatarSubmitButton, originalButtonText, "Сохранение...");
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      hideLoading(avatarSubmitButton, originalButtonText);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const originalButtonText = cardSubmitButton.textContent;
  showLoading(cardSubmitButton, originalButtonText, "Создание...");
  addCard({name: cardNameInput.value, link: cardLinkInput.value})
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          userId
        )
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      hideLoading(cardSubmitButton, originalButtonText);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

const handleLikeCard = (cardId, likeButton) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      const likeCountElement = likeButton.parentElement.querySelector(".card__like-count");
      if (likeCountElement) {
        likeCountElement.textContent = cardData.likes.length;
      }
      likeCard(likeButton);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardID, cardElement) => {
  currentCardIdToDelete = cardID;
  currentCardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};


const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  const originalButtonText = removeCardSubmitButton.textContent;
  showLoading(removeCardSubmitButton, originalButtonText, "Удаление...");
  deleteCardFromServer(currentCardIdToDelete)
    .then(() => {
      deleteCard(currentCardElementToDelete);
      closeModalWindow(removeCardModalWindow);
      currentCardIdToDelete = null;
      currentCardElementToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    });
};

removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

const getCardsStatistics = () => {
  return getCardList()
    .then((cards) => {
      const totalUsers = new Set();
      const userLikes = {};
      const userCards = {};
      let totalLikes = 0;
      
      cards.forEach((card) => {
        totalLikes += card.likes.length;
        
        card.likes.forEach((like) => {
          totalUsers.add(like._id);
          
          if (userLikes[like._id]) {
            userLikes[like._id] += 1;
          } else {
            userLikes[like._id] = 1;
          }
          
          if (!userCards[like._id]) {
            userCards[like._id] = [];
          }
          userCards[like._id].push(card.name);
        });
      });
      
      let topLikerId = null;
      let maxLikes = 0;
      
      const userIds = Object.keys(userLikes);
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const likesCount = userLikes[userId];
        if (likesCount > maxLikes) {
          maxLikes = likesCount;
          topLikerId = userId;
        }
      }
      
      let championName = "Неизвестный";
      let championCards = [];
      
      if (topLikerId) {
        let foundUser = null;
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          for (let j = 0; j < card.likes.length; j++) {
            const like = card.likes[j];
            if (like._id === topLikerId) {
              foundUser = like;
              break;
            }
          }
          if (foundUser) break;
        }
        
        if (foundUser) {
          championName = foundUser.name;
          championCards = userCards[topLikerId] || [];
        }
      }
      
      return {
        totalUsers: totalUsers.size,
        totalLikes,
        maxLikesPerUser: maxLikes,
        championName,
        championCards,
      };
    });
};

const showCardsStatistics = () => {
  infoTitle.textContent = "Статистика карточек";
  infoContent.innerHTML = "";
  infoList.innerHTML = "";
  infoText.textContent = "Популярные карточки:";
  
  openModalWindow(infoModalWindow);
  
  getCardsStatistics()
    .then((stats) => {
      const definitionTemplate = document.getElementById("popup-info-definition-template");
      const userPreviewTemplate = document.getElementById("popup-info-user-preview-template");
      
      const statsData = [
        { term: "Всего пользователей", description: stats.totalUsers },
        { term: "Всего лайков", description: stats.totalLikes },
        { term: "Максимально лайков от одного", description: stats.maxLikesPerUser },
        { term: "Чемпион лайков", description: stats.championName },
      ];
      
      statsData.forEach((item) => {
        const definitionClone = definitionTemplate.content.cloneNode(true);
        const dt = definitionClone.querySelector(".popup__info-term");
        const dd = definitionClone.querySelector(".popup__info-description");
        
        dt.textContent = item.term;
        dd.textContent = item.description;
        
        infoContent.appendChild(definitionClone);
      });
      
      const topCards = stats.championCards.slice(0, 3);
      topCards.forEach((cardName) => {
        const userPreviewClone = userPreviewTemplate.content.cloneNode(true);
        const listItem = userPreviewClone.querySelector(".popup__list-item");
        listItem.textContent = cardName;
        
        infoList.appendChild(userPreviewClone);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

logo.addEventListener("click", showCardsStatistics);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`
    profileTitle.textContent = userData.name
    profileDescription.textContent = userData.about

    userId = userData._id

    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard
        }, userId)
      )
    })
  })
  .catch((err) => {
    console.log(err);
  });