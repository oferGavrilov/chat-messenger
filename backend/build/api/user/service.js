import { User } from "../../models/user.model.js";
import { generateToken } from "../../config/generateToken.js";
import { handleErrorService } from "../../middleware/errorMiddleware.js";
export async function signUpUser(username, email, password, profileImg) {
    try {
        if (!username || !email || !password) {
            return { error: 'Please enter all fields' };
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return { error: 'User already exists' };
        }
        if (!profileImg || profileImg.trim() === '') {
            profileImg = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
        }
        const newUser = await User.create({
            username,
            email,
            password,
            profileImg,
            about: User.schema.path('about').default('Available'),
        });
        if (newUser) {
            const user = {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profileImg: newUser.profileImg,
                about: newUser.about,
                token: generateToken(newUser._id),
            };
            return { user };
        }
        else {
            return { error: 'Invalid user data' };
        }
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function loginUser(email, password) {
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return { error: 'Invalid email or password' };
        }
        const passwordMatch = await user.verifyPassword(password);
        if (!passwordMatch) {
            return { error: 'Invalid email or password' };
        }
        await user.save();
        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImg: user.profileImg,
                about: user.about,
            }
        };
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function resetPasswordConfirm(token, password) {
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            throw new Error('Password reset token is invalid or has expired.');
        }
        if (user) {
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }
        else {
            throw new Error('User not found');
        }
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function searchUsers(keyword) {
    try {
        const clearString = keyword?.replace(/[\/>]/g, '');
        const filter = clearString ? {
            $or: [
                { username: { $regex: clearString, $options: 'i' } },
                { email: { $regex: clearString, $options: 'i' } }
            ]
        } : {};
        const users = await User.find({ ...filter });
        return users;
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function getUsersService(loggedInUserId) {
    try {
        const users = await User.find({ _id: { $ne: loggedInUserId } });
        return users;
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function editUserDetailsService(userId, newName) {
    try {
        const user = await User.findById(userId);
        console.log('user:', user);
        if (user) {
            user.username = newName;
            await user.save();
            return user;
        }
        return null;
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function editUserImageService(userId, newImage) {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.profileImg = newImage;
            await user.save();
            return user.profileImg;
        }
        return null;
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
export async function validateUser(userId) {
    try {
        const user = await User.findById(userId);
        if (user) {
            return user;
        }
        return null;
    }
    catch (error) {
        throw handleErrorService(error);
    }
}
//# sourceMappingURL=service.js.map