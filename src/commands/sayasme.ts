import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import config from "../lib/config.js";
import { isGuildTextBasedChannel } from "../type-utils.js";

const sayasmeCommand = {
	data: new SlashCommandBuilder()
		.setName("sayasme")
		.setDescription("Impersonate me (admin only)")
		.addStringOption((option) =>
			option
				.setName("text")
				.setDescription("The text stationguessr shall preach")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		if (!config.ADMINS.has(userId)) {
			return interaction.reply({
				content: "Thou doth not have the authority to do thus",
				flags: [MessageFlags.Ephemeral],
			});
		}
		const text = interaction.options.getString("text");
		if (!text) {
			return interaction.reply({
				content: "Failed to get your inputs",
				flags: [MessageFlags.Ephemeral],
			});
		}
		const { channel } = interaction;
		if (!channel || !isGuildTextBasedChannel(channel)) {
			return interaction.reply({
				content: "Failed to find your channel, or it is invalid",
				flags: [MessageFlags.Ephemeral],
			});
		}
		try {
			await channel.send({
				content: text,
			});
			return interaction.reply({
				content: "Sent the message!",
				flags: [MessageFlags.Ephemeral],
			});
		} catch(error) {
			console.error("Error in sayasme command:", error);
			return interaction.reply({
				content: `Error: ${error}`,
				flags: [MessageFlags.Ephemeral],
			});
		}
	}
}

export default sayasmeCommand;
